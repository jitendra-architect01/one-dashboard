import React, { useState, useEffect } from "react";
import { AuthService } from "../../services/authService";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { callEdgeFunction, supabase } from "../../lib/supabase";
import {
  Users,
  Edit,
  Trash2,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";

interface Employee {
  user_id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  business_unit_id: string | null;
  business_unit_name?: string;
  manager_id?: string | null;
  manager_email?: string | null;
  hire_date: string;
  role: "admin" | "manager" | "employee" | "viewer";
  is_active: boolean;
  phone?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

interface BulkUpload {
  fileName: string;
  status: "processing" | "completed" | "failed";
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  uploadedAt: string;
}

// Database functions for employee management
const createUserInAuth = async (
  email: string,
  password: string
): Promise<string | null> => {
  return await AuthService.signUpUser(email, password, {
    role: "employee",
    type: "employee",
  });
};

const sendConfirmationEmail = async (email: string): Promise<boolean> => {
  try {
    const ok = await AuthService.triggerPasswordReset(
      email,
      `${window.location.origin}/reset-password`
    );
    if (!ok) return false;

    return true;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return false;
  }
};

// Create employee profile in DB and attach the auth user_id
const createEmployeeProfile = async (
  employeeData: Partial<Employee>,
  userId: string
): Promise<Employee | null> => {
  try {
    const created = await AuthService.createEmployeeProfile({
      ...employeeData,
      user_id: userId,
    });
    if (!created) return null;
    return created as Employee;
  } catch (error) {
    console.error("Error creating employee profile:", error);
    return null;
  }
};

const resetEmployeePassword = async (
  email: string,
  employeeName: string
): Promise<boolean> => {
  try {
    const ok = await AuthService.triggerPasswordReset(
      email,
      `${window.location.origin}/`
    );
    if (!ok) return false;
    console.log(
      `Password reset email sent to ${email} for employee ${employeeName}`
    );
    return true;
  } catch (error) {
    console.error("Error resetting employee password:", error);
    return false;
  }
};

const fetchEmployeesFromDatabase = async (): Promise<Employee[]> => {
  try {
    const data = await AuthService.listEmployeeProfiles();
    return (data || []).map((emp: any) => ({
      ...emp,
      business_unit_name: emp.business_units?.name || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

const addEmployeeToDatabase = async (
  employeeData: Partial<Employee>
): Promise<Employee | null> => {
  try {
    // 1) Create auth user
    const tempPassword = AuthService.generateTemporaryPassword(12);
    const userId = await createUserInAuth(employeeData.email!, tempPassword);
    if (!userId) {
      throw new Error("Failed to create user in auth system");
    }

    // 2) Send email
    await sendConfirmationEmail(employeeData.email!);

    // 3) Create employee profile
    const profile = await createEmployeeProfile(employeeData, userId);
    if (!profile) return null;
    return profile;
  } catch (error) {
    console.error("Error adding employee:", error);
    return null;
  }
};

const updateEmployeeInDatabase = async (
  code: string,
  employeeData: Partial<Employee>
): Promise<Employee | null> => {
  try {
    // Normalize manager_id: empty string -> null
    const normalizedData: Partial<Employee> = {
      ...employeeData,
      manager_id:
        typeof employeeData.manager_id === "string" &&
        employeeData.manager_id.trim() === ""
          ? null
          : employeeData.manager_id ?? null,
    };
    // If email is being updated, we need to update the auth user as well
    if (normalizedData.email) {
      console.log("updating email", normalizedData.email);
      // First, get the current employee to find the user_id
      const currentEmployee =
        await AuthService.getEmployeeProfileByEmployeeCode(code);

      if (
        currentEmployee?.user_id &&
        currentEmployee.email !== normalizedData.email
      ) {
        // Update the auth user's email via Edge Function
        const { error: updateErr } = await (async () => {
          const { error } = await callEdgeFunction<{ success: boolean }>(
            "update-user",
            { user_id: currentEmployee.user_id, email: normalizedData.email }
          );
          return { error };
        })();

        if (updateErr) {
          console.error("Error updating auth user email:", updateErr);
          // Continue with profile update even if auth update fails
        }
      }
    }

    const updated = await AuthService.updateEmployeeProfile(
      code,
      normalizedData as Record<string, unknown>
    );
    if (!updated) return null;
    return updated as Employee;
  } catch (error) {
    console.error("Error updating employee:", error);
    return null;
  }
};

//workign fine
const deleteEmployeeFromDatabase = async (code: string): Promise<boolean> => {
  try {
    // First, get the employee to find the user_id
    const employee = await AuthService.getEmployeeProfileByEmployeeCode(code);
    console.log("JJ employee", JSON.stringify(employee));
    // Delete the employee profile first (this will cascade to related records)
    const profileDeleted = await AuthService.deleteEmployeeProfile(
      employee?.id as string
    );
    if (!profileDeleted) return false;
    return true;
  } catch (error) {
    console.error("Error deleting employee:", error);
    return false;
  }
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [uploadHistory, setUploadHistory] = useState<BulkUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<
    "admin" | "manager" | "viewer"
  >("admin");
  const [newUserType, setNewUserType] = useState<
    "admin" | "manager" | "employee" | "viewer"
  >("admin");
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Load employees from database on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEmployees = await fetchEmployeesFromDatabase();
      setEmployees(fetchedEmployees);
    } catch (err) {
      setError("Failed to load employees");
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  };
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" || emp.department === filterDepartment;
    const matchesRole = filterRole === "all" || emp.role === filterRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  const teams = [...new Set(employees.map((emp) => emp.department))];

  // Fetch business units for the form dropdown
  const [businessUnits, setBusinessUnits] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);

  useEffect(() => {
    const fetchBusinessUnits = async () => {
      try {
        const { data, error } = await supabase
          .from("business_units")
          .select("id, name, code")
          .eq("is_active", true)
          .order("name");

        if (error) {
          console.error("Error fetching business units:", error);
        } else {
          setBusinessUnits(data || []);
        }
      } catch (error) {
        console.error("Error fetching business units:", error);
      }
    };

    fetchBusinessUnits();
  }, []);

  const getRoleColor = (role: Employee["role"]) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-indigo-100 text-indigo-800";
      case "employee":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddEmployee = () => {
    setShowAddForm(true);
    setEditingEmployee(null);
    setFormData({
      employee_code: "",
      first_name: "",
      last_name: "",
      email: "",
      job_title: "",
      department: "",
      business_unit_id: null,
      manager_email: "",
      hire_date: new Date().toISOString().split("T")[0],
      role: "employee",
      is_active: true,
      phone: "",
      location: "",
    });
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowAddForm(true);
    setFormData({
      employee_code: employee.employee_code,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      job_title: employee.job_title,
      department: employee.department,
      business_unit_id: employee.business_unit_id,
      manager_email: employee.manager_email || "",
      hire_date: employee.hire_date,
      role: employee.role,
      is_active: employee.is_active,
      phone: employee.phone || "",
      location: employee.location || "",
    });
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      const success = await deleteEmployeeFromDatabase(employeeId);
      if (success) {
        await loadEmployees(); // Refresh the list
        alert("Employee deleted successfully!");
      } else {
        alert("Failed to delete employee. Please try again.");
      }
    }
  };

  const handleResetPassword = async (employee: Employee) => {
    if (!employee.user_id) {
      // Create user account for legacy employee
      if (
        confirm(
          `This employee doesn't have a user account yet. Would you like to create one now?`
        )
      ) {
        const created = await addEmployeeToDatabase({
          employee_code: employee.employee_code,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          designation: employee.designation,
          business_unit_id: employee.business_unit_id,
          business_unit_name: employee.business_unit_name,
          team: employee.team,
          skill: employee.skill,
          manager_email: employee.manager_email,
        });
        if (created?.id) {
          employee.user_id = created.user_id as string;
        }

        alert("User account created and setup email sent.");
        await loadEmployees(); // Refresh the list
        return;
      }
      return;
    }

    if (
      confirm(
        `Are you sure you want to reset the password for ${employee.first_name} ${employee.last_name}?`
      )
    ) {
      const ok = await resetEmployeePassword(
        employee.email,
        `${employee.first_name} ${employee.last_name}`
      );

      if (ok) alert("Password reset email sent successfully.");
      else alert("Failed to send password reset email. Please try again.");
    }
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    alert("Creating user... in handleSaveEmployee");
    e.preventDefault();
    console.log("formData", JSON.stringify(formData));
    // Validate required fields
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.employee_code
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Check for duplicate employee code
    const existingEmployee = employees.find(
      (emp) =>
        emp.employee_code === formData.employee_code &&
        (!editingEmployee ||
          emp.employee_code !== editingEmployee.employee_code)
    );
    if (existingEmployee) {
      alert("Employee code already exists. Please use a unique employee code.");
      return;
    }

    // Check for duplicate email
    const existingEmail = employees.find(
      (emp) =>
        emp.email === formData.email &&
        (!editingEmployee ||
          emp.employee_code !== editingEmployee.employee_code)
    );
    if (existingEmail) {
      alert("Email already exists. Please use a unique email address.");
      return;
    }

    if (editingEmployee) {
      // Update existing employee in database
      const updatedEmployee = await updateEmployeeInDatabase(
        editingEmployee.employee_code,
        {
          employee_code: formData.employee_code!,
          first_name: formData.first_name!,
          last_name: formData.last_name!,
          email: formData.email!,
          job_title: formData.job_title || "",
          department: formData.department || "",
          business_unit_id: formData.business_unit_id,
          manager_email: formData.manager_email?.trim()
            ? formData.manager_email
            : null,
          hire_date:
            formData.hire_date || new Date().toISOString().split("T")[0],
          role: formData.role || "employee",
          is_active:
            formData.is_active !== undefined ? formData.is_active : true,
          phone: formData.phone || "",
          location: formData.location || "",
        }
      );

      if (updatedEmployee) {
        await loadEmployees(); // Refresh the list
      } else {
        alert("Failed to update employee. Please try again.");
        return;
      }
    } else {
      // Add new employee to database
      const result = await addEmployeeToDatabase({
        employee_code: formData.employee_code!,
        first_name: formData.first_name!,
        last_name: formData.last_name!,
        email: formData.email!,
        job_title: formData.job_title || "",
        department: formData.department || "",
        business_unit_id: formData.business_unit_id,
        manager_email: formData.manager_email?.trim()
          ? formData.manager_email
          : null,
        manager_id:
          typeof formData.manager_id === "string" &&
          formData.manager_id.trim() === ""
            ? null
            : formData.manager_id ?? null,
        hire_date: formData.hire_date || new Date().toISOString().split("T")[0],
        role: formData.role || "employee",
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        phone: formData.phone || "",
        location: formData.location || "",
      });

      if (result) {
        await loadEmployees(); // Refresh the list
      } else {
        alert("Failed to add employee. Please try again.");
        return;
      }
    }

    // Close form and reset
    setShowAddForm(false);
    setEditingEmployee(null);
    setFormData({});

    // Show success message
    alert(
      editingEmployee
        ? "Employee updated successfully!"
        : "Employee added successfully!"
    );
  };

  const handleInputChange = (
    field: keyof Employee,
    value: string | boolean | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingEmployee(null);
    setFormData({});
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    alert("Creating user...");
    e.preventDefault();
    setCreateUserError(null);
    if (!newUserEmail || !newUserPassword) {
      setCreateUserError("Email and password are required");
      return;
    }
    try {
      setCreatingUser(true);
      const userId = await AuthService.signUpUser(
        newUserEmail,
        newUserPassword,
        {
          role: newUserRole,
          type: newUserType,
        }
      );
      setCreatingUser(false);
      if (!userId) {
        setCreateUserError("Failed to create user. Please try again.");
        return;
      }
      setShowCreateUserModal(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("viewer");
      setNewUserType("employee");
    } catch (err) {
      console.error("Error creating user:", err);
      setCreatingUser(false);
      setCreateUserError("Unexpected error. Please try again.");
    }
  };

  const downloadTemplate = () => {
    // Create Excel template with proper formatting
    const templateData = [
      [
        "Employee_Code",
        "First_Name",
        "Last_Name",
        "Email",
        "Job_Title",
        "Department",
        "Business_Unit_Code",
        "Manager_Email",
        "Hire_Date",
        "Role",
        "Phone",
        "Location",
        "Is_Active",
      ],
      [
        "EMP004",
        "Jane",
        "Doe",
        "jane.doe@company.com",
        "Product Manager",
        "Product Strategy",
        "PRODUCT",
        "director@company.com",
        "2025-01-15",
        "Manager",
        "+1 (555) 456-7890",
        "Seattle, WA",
        "TRUE",
      ],
      [
        "EMP005",
        "Mike",
        "Johnson",
        "mike.johnson@company.com",
        "Sales Representative",
        "Enterprise Sales",
        "SALES",
        "john.smith@company.com",
        "2025-01-20",
        "Associate",
        "+1 (555) 567-8901",
        "Chicago, IL",
        "TRUE",
      ],
      [
        "EMP006",
        "Sarah",
        "Williams",
        "sarah.williams@company.com",
        "Marketing Manager",
        "Digital Marketing",
        "MARKETING",
        "director@company.com",
        "2025-01-10",
        "Manager",
        "+1 (555) 678-9012",
        "Los Angeles, CA",
        "TRUE",
      ],
    ];

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 12 }, // Employee_Code
      { wch: 15 }, // First_Name
      { wch: 15 }, // Last_Name
      { wch: 25 }, // Email
      { wch: 20 }, // Job_Title
      { wch: 20 }, // Department
      { wch: 18 }, // Business_Unit_Code
      { wch: 25 }, // Manager_Email
      { wch: 12 }, // Hire_Date
      { wch: 10 }, // Role
      { wch: 18 }, // Phone
      { wch: 15 }, // Location
      { wch: 10 }, // Is_Active
    ];
    ws["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Employee Template");

    // Generate Excel file and download
    XLSX.writeFile(wb, "employee_upload_template.xlsx");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Check file type
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv") || file.type === "text/csv";
    const isExcel =
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    if (!isCSV && !isExcel) {
      alert("Please upload a CSV (.csv) or Excel (.xlsx, .xls) file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (isCSV) {
        // Parse CSV file
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processEmployeeData(
              results.data as Record<string, string>[],
              file.name
            );
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            setIsUploading(false);
            alert("Error parsing CSV file. Please check the format.");
          },
        });
      } else {
        // Parse Excel file using xlsx library
        setUploadProgress(25);

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            setUploadProgress(50);

            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });

            // Get the first worksheet
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];

            setUploadProgress(75);

            // Convert to JSON with header row
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              defval: "",
            });

            // Convert array format to object format with headers
            if (jsonData.length > 1) {
              const headers = jsonData[0] as string[];
              const rows = jsonData.slice(1) as string[][];

              const objectData = rows.map((row) => {
                const obj: Record<string, string> = {};
                headers.forEach((header, index) => {
                  obj[header] = row[index] || "";
                });
                return obj;
              });

              processEmployeeData(objectData, file.name);
            } else {
              throw new Error(
                "Excel file appears to be empty or has no data rows"
              );
            }
          } catch (error) {
            console.error("Excel parsing error:", error);
            setIsUploading(false);
            setUploadProgress(0);
            alert(
              "Error parsing Excel file. Please check the format and try again."
            );
          }
        };

        reader.onerror = () => {
          console.error("File reading error");
          setIsUploading(false);
          setUploadProgress(0);
          alert("Error reading the file. Please try again.");
        };

        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error("Upload failed:", error);

      const failedUpload: BulkUpload = {
        fileName: file.name,
        status: "failed",
        totalRecords: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [
          "Failed to process file. Please check the format and try again.",
        ],
        uploadedAt: new Date().toISOString(),
      };

      setUploadHistory((prev) => [failedUpload, ...prev]);
      alert("Upload failed. Please check the file format and try again.");
    }
  };

  const processEmployeeData = async (
    data: Record<string, string>[],
    fileName: string
  ) => {
    setUploadProgress(75);

    const errors: string[] = [];
    const newEmployees: Employee[] = [];
    const businessUnitMap: { [key: string]: string } = {
      LEADERSHIP: "leadership",
      SALES: "sales",
      MARKETING: "marketing",
      SERVICES: "professional_services",
      PRODUCT: "product_engineering",
      SUCCESS: "customer_success",
      HR: "human_resources",
    };

    // Validate and process each row
    data.forEach((row: Record<string, string>, index: number) => {
      const rowNum = index + 2; // Account for header row

      // Required field validation
      if (
        !row.Employee_Code ||
        !row.First_Name ||
        !row.Last_Name ||
        !row.Email
      ) {
        errors.push(
          `Row ${rowNum}: Missing required fields (Employee_Code, First_Name, Last_Name, Email)`
        );
        return;
      }

      // Check for duplicate employee ID
      if (
        employees.find((emp) => emp.employee_code === row.Employee_Code) ||
        newEmployees.find((emp) => emp.employee_code === row.Employee_Code)
      ) {
        errors.push(
          `Row ${rowNum}: Duplicate Employee_Code: ${row.Employee_Code}`
        );
        return;
      }

      // Check for duplicate email
      if (
        employees.find((emp) => emp.email === row.Email) ||
        newEmployees.find((emp) => emp.email === row.Email)
      ) {
        errors.push(`Row ${rowNum}: Duplicate Email: ${row.Email}`);
        return;
      }

      // Map business unit code from CSV to actual DB business_unit_id (UUID)
      const businessUnitCode =
        businessUnitMap[row.Business_Unit_Code?.toUpperCase()] || "sales";
      const buRecord = businessUnits.find(
        (bu) =>
          bu.code === businessUnitCode ||
          bu.name.toLowerCase().replace(/\s+/g, "_") === businessUnitCode
      );
      if (!buRecord) {
        errors.push(
          `Row ${rowNum}: Invalid Business_Unit_Code: ${row.Business_Unit_Code}`
        );
        return;
      }

      // Validate role
      const validRoles = [
        "Associate",
        "Lead",
        "Manager",
        "Director",
        "VP",
        "CXO",
      ];
      const role = validRoles.includes(row.Role) ? row.Role : "Associate";

      // Create employee object
      const newEmployee: Employee = {
        employee_code: row.Employee_Code,
        first_name: row.First_Name,
        last_name: row.Last_Name,
        email: row.Email,
        job_title: row.Job_Title || "",
        business_unit_id: buRecord.id,
        business_unit_name: buRecord.name,
        department: row.Department || "",
        phone: row.Phone || "",
        manager_email: row.Manager_Email || "",
        hire_date: row.Hire_Date || new Date().toISOString().split("T")[0],
        role: role as Employee["role"],
        is_active: row.Is_Active?.toUpperCase() !== "FALSE",
        location: row.Location || "",
      };
      console.log("JJ newEmployee", JSON.stringify(newEmployee));
      newEmployees.push(newEmployee);
    });

    setUploadProgress(100);

    // Add successful employees to the list and create user accounts
    if (newEmployees.length > 0) {
      // Create user accounts for each employee
      for (const employee of newEmployees) {
        try {
          console.log(
            "Creating user... in processEmployeeData" + JSON.stringify(employee)
          );
          // Create auth user + profile via shared flow
          const created = await addEmployeeToDatabase({
            employee_code: employee.employee_code,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            job_title: employee.job_title,
            business_unit_id: employee.business_unit_id,
            department: employee.department,
            phone: employee.phone,
            manager_email: employee.manager_email,
          });
          if (created?.user_id) {
            employee.user_id = created.user_id as string;
          }
        } catch (error) {
          console.error(
            `Error creating user account for ${employee.email}:`,
            error
          );
          // Continue with other employees
        }
      }

      setEmployees((prev) => [...prev, ...newEmployees]);
    }

    // Create upload history record
    const newUpload: BulkUpload = {
      fileName: fileName,
      status:
        errors.length === 0
          ? "completed"
          : newEmployees.length > 0
          ? "completed"
          : "failed",
      totalRecords: data.length,
      successfulImports: newEmployees.length,
      failedImports: data.length - newEmployees.length,
      errors: errors,
      uploadedAt: new Date().toISOString(),
    };

    setUploadHistory((prev) => [newUpload, ...prev]);

    // Show results
    if (errors.length === 0) {
      alert(
        `✅ Successfully imported ${newEmployees.length} employees from ${fileName}\n\n` +
          `User accounts have been created and confirmation emails sent to all employees.`
      );
    } else if (newEmployees.length > 0) {
      alert(
        `⚠️ Partially successful: ${newEmployees.length} imported, ${errors.length} errors.\n\n` +
          `User accounts have been created for successful imports and confirmation emails sent.\n` +
          `Check upload history for error details.`
      );
    } else {
      alert(
        `❌ Upload failed: ${errors.length} errors found. Check upload history for details.`
      );
    }

    setIsUploading(false);
    setUploadProgress(0);
  };
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Employee Management
              </h1>
              <p className="text-lg text-gray-600">
                Manage employee profiles, roles, and assignments
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="inline-flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Automatic user account creation
                </span>
                <span className="inline-flex items-center ml-4">
                  <Mail className="w-4 h-4 mr-1 text-blue-500" />
                  Confirmation emails sent
                </span>
                <span className="inline-flex items-center ml-4">
                  <Shield className="w-4 h-4 mr-1 text-orange-500" />
                  Password management
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadEmployees}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={handleAddEmployee}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </button>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              Create User
            </button>
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Employees
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {employees.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {employees.filter((emp) => emp.is_active).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Managers
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {employees.filter((emp) => emp.role === "manager").length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Teams</p>
                <p className="text-3xl font-bold text-orange-600">
                  {teams.length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="Associate">Associate</option>
              <option value="Lead">Lead</option>
              <option value="Manager">Manager</option>
              <option value="Director">Director</option>
              <option value="VP">VP</option>
              <option value="CXO">CXO</option>
            </select>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading employees...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Employees
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadEmployees}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Employee List */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Employees ({filteredEmployees.length})
                </h2>
                <div className="text-sm text-gray-600">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Password Reset
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    Click the shield icon to reset passwords or create user
                    accounts
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-white">
                              {employee.first_name.charAt(0)}
                              {employee.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.employee_code}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.job_title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {employee.email}
                          </div>
                          {employee.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {employee.phone}
                            </div>
                          )}
                          {employee.location && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {employee.location}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              employee.role
                            )}`}
                          >
                            {employee.role}
                          </span>
                          <div className="text-sm text-gray-900">
                            {employee.department}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.business_unit_name || "Unknown"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.manager_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              employee.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {employee.is_active ? "Active" : "Inactive"}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(employee.hire_date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Employee"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {employee.user_id && (
                            <button
                              onClick={() => handleResetPassword(employee)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Reset Password"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteEmployee(employee.employee_code)
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEmployees.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No employees found
                </h3>
                <p className="text-gray-600">
                  {searchTerm ||
                  filterDepartment !== "all" ||
                  filterRole !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by adding your first employee."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Employee Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h3>
              {!editingEmployee && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> When you add a new employee, a user
                    account will be automatically created in the authentication
                    system and a confirmation email will be sent to the employee
                    with their login credentials.
                  </p>
                </div>
              )}

              <form onSubmit={handleSaveEmployee} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Code *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="EMP001"
                      value={formData.employee_code || ""}
                      onChange={(e) =>
                        handleInputChange("employee_code", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID *
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john.smith@company.com"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                      value={formData.first_name || ""}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Smith"
                      value={formData.last_name || ""}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Unit
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.business_unit_id || ""}
                      onChange={(e) =>
                        handleInputChange("business_unit_id", e.target.value)
                      }
                    >
                      <option value="">Select Business Unit</option>
                      {businessUnits.map((bu) => (
                        <option key={bu.id} value={bu.id}>
                          {bu.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enterprise Sales"
                      value={formData.department || ""}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Sales Manager"
                      value={formData.job_title || ""}
                      onChange={(e) =>
                        handleInputChange("job_title", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Sales Strategy"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manager Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="manager@company.com"
                      value={formData.manager_email || ""}
                      onChange={(e) =>
                        handleInputChange("manager_email", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.hire_date || ""}
                      onChange={(e) =>
                        handleInputChange("hire_date", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.role || "Associate"}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      required
                    >
                      <option value="Associate">Associate</option>
                      <option value="Lead">Lead</option>
                      <option value="Manager">Manager</option>
                      <option value="Director">Director</option>
                      <option value="VP">VP</option>
                      <option value="CXO">CXO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New York, NY"
                      value={formData.location || ""}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active !== false}
                        onChange={(e) =>
                          handleInputChange("is_active", e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Active Employee
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingEmployee ? "Update Employee" : "Save Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bulk Employee Upload
                </h3>
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Template Download */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Download Template
                    </h4>
                    <p className="text-sm text-blue-700">
                      Get the Excel template with sample data and required
                      columns
                    </p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </button>
                </div>
              </div>

              {/* Upload Area */}
              <div className="mb-6">
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />

                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                    </div>

                    {isUploading ? (
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Processing Upload...
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {uploadProgress}% complete
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Drop your Excel file here, or click to browse
                        </p>
                        <p className="text-sm text-gray-600">
                          Supports .xlsx, .xls, and .csv files
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload History */}
              {uploadHistory.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Recent Uploads
                  </h4>
                  <div className="space-y-3">
                    {uploadHistory.slice(0, 3).map((upload) => (
                      <div
                        key={upload.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              upload.status === "completed"
                                ? "bg-green-100"
                                : upload.status === "failed"
                                ? "bg-red-100"
                                : "bg-yellow-100"
                            }`}
                          >
                            {upload.status === "completed" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : upload.status === "failed" ? (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <Upload className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {upload.fileName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {upload.successfulImports} imported,{" "}
                              {upload.failedImports} failed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(upload.uploadedAt).toLocaleDateString()}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              upload.status === "completed"
                                ? "text-green-600"
                                : upload.status === "failed"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {upload.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">
                  Excel Upload Instructions:
                </h4>
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> When you upload employees via Excel,
                    user accounts will be automatically created in the
                    authentication system and confirmation emails will be sent
                    to each employee with their login credentials.
                  </p>
                </div>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>
                    • Download the template to see the required column format
                  </li>
                  <li>• Employee_Code must be unique (e.g., EMP001, EMP002)</li>
                  <li>• Email addresses must be unique</li>
                  <li>
                    • Business_Unit_Code: SALES, MARKETING, PRODUCT, SERVICES,
                    SUCCESS, HR, LEADERSHIP
                  </li>
                  <li>• Role: Associate, Lead, Manager, Director, VP, CXO</li>
                  <li>• Is_Active: TRUE or FALSE</li>
                  <li>• Date format: YYYY-MM-DD (e.g., 2025-01-15)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create User
                </h3>
                <button
                  onClick={() => setShowCreateUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                {createUserError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {createUserError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@company.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Strong password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUserRole}
                    onChange={(e) =>
                      setNewUserRole(
                        e.target.value as "admin" | "manager" | "viewer"
                      )
                    }
                  >
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                    <option value="viewer">viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUserType}
                    onChange={(e) =>
                      setNewUserType(
                        e.target.value as
                          | "admin"
                          | "manager"
                          | "employee"
                          | "viewer"
                      )
                    }
                  >
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                    <option value="employee">employee</option>
                    <option value="viewer">viewer</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={creatingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    disabled={creatingUser}
                  >
                    {creatingUser ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
