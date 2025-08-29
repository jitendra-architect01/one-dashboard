import { supabase } from "../lib/supabase";
import type {
  BusinessUnit,
  KPIDefinition,
  Initiative,
  ActionItem,
  EmployeeProfile,
} from "../lib/supabase";

// Sample data to populate the database
const businessUnits = [
  {
    code: "sales",
    name: "Sales",
    description: "ARR attainment, pipeline management, and win rate tracking",
    icon: "TrendingUp",
    color: "bg-blue-500",
  },
  {
    code: "marketing",
    name: "Marketing",
    description:
      "Lead generation, SQL conversion, and pipeline contribution metrics",
    icon: "Megaphone",
    color: "bg-green-500",
  },
  {
    code: "professional_services",
    name: "Professional Services",
    description:
      "Revenue delivery, margin optimization, and client satisfaction tracking",
    icon: "Briefcase",
    color: "bg-orange-500",
  },
  {
    code: "product_engineering",
    name: "Product & Engineering",
    description:
      "Feature delivery, release performance, and product adoption metrics",
    icon: "Code",
    color: "bg-indigo-500",
  },
  {
    code: "customer_success",
    name: "Customer Success",
    description:
      "Churn management, retention rates, and customer expansion tracking",
    icon: "HeadphonesIcon",
    color: "bg-teal-500",
  },
  {
    code: "human_resources",
    name: "Human Resources",
    description:
      "Talent acquisition, retention metrics, and organizational development",
    icon: "UserCheck",
    color: "bg-pink-500",
  },
  {
    code: "general_administrative",
    name: "General & Administrative",
    description:
      "Administrative functions, compliance, and operational support",
    icon: "FileText",
    color: "bg-gray-500",
  },
];

const kpiDefinitions = [
  // Sales KPIs
  {
    name: "Year 1 ARR Net Pipeline",
    description: "Net pipeline value for Year 1 ARR deals",
    calculation_formula:
      "SUM(CASE WHEN deal_type = 'new' AND arr_year = 1 THEN pipeline_value ELSE 0 END)",
    dependent_metrics: ["pipeline_value", "deal_type", "arr_year"],
    unit: "$",
    target_value: 3200000,
    trend_direction: "up",
    color: "bg-blue-500",
    is_visible_on_dashboard: true,
    display_order: 1,
  },
  {
    name: "Total ARR Pipeline",
    description: "Total pipeline value across all ARR deals",
    calculation_formula: "SUM(pipeline_value)",
    dependent_metrics: ["pipeline_value"],
    unit: "$",
    target_value: 4500000,
    trend_direction: "up",
    color: "bg-blue-500",
    is_visible_on_dashboard: false,
    display_order: 2,
  },
  {
    name: "Win Rate",
    description: "Percentage of deals won vs total opportunities",
    calculation_formula:
      "(COUNT(CASE WHEN status = 'won' THEN 1 END) * 100.0 / COUNT(*))",
    dependent_metrics: ["status"],
    unit: "%",
    target_value: 25,
    trend_direction: "neutral",
    color: "bg-blue-500",
    is_visible_on_dashboard: false,
    display_order: 3,
  },

  // Marketing KPIs
  {
    name: "Total DMs Booked",
    description: "Total discovery meetings booked",
    calculation_formula:
      "COUNT(CASE WHEN meeting_type = 'discovery' THEN 1 END)",
    dependent_metrics: ["meeting_type"],
    unit: "meetings",
    target_value: 180,
    trend_direction: "up",
    color: "bg-green-500",
    is_visible_on_dashboard: true,
    display_order: 4,
  },
  {
    name: "MQL to SQL %",
    description: "Conversion rate from MQL to SQL",
    calculation_formula:
      "(COUNT(CASE WHEN lead_status = 'sql' THEN 1 END) * 100.0 / COUNT(CASE WHEN lead_status = 'mql' THEN 1 END))",
    dependent_metrics: ["lead_status"],
    unit: "%",
    target_value: 50.0,
    trend_direction: "neutral",
    color: "bg-green-500",
    is_visible_on_dashboard: false,
    display_order: 5,
  },
  {
    name: "Cost per MQL",
    description: "Marketing cost per Marketing Qualified Lead",
    calculation_formula:
      "SUM(marketing_spend) / COUNT(CASE WHEN lead_status = 'mql' THEN 1 END)",
    dependent_metrics: ["marketing_spend", "lead_status"],
    unit: "$",
    target_value: 75,
    trend_direction: "down",
    color: "bg-green-500",
    is_visible_on_dashboard: false,
    display_order: 6,
  },

  // Professional Services KPIs
  {
    name: "PS Revenue Generated",
    description: "Professional Services revenue generated",
    calculation_formula:
      "SUM(CASE WHEN revenue_type = 'ps' THEN revenue_amount ELSE 0 END)",
    dependent_metrics: ["revenue_amount", "revenue_type"],
    unit: "$",
    target_value: 2000000,
    trend_direction: "up",
    color: "bg-orange-500",
    is_visible_on_dashboard: true,
    display_order: 7,
  },
  {
    name: "PS Margin %",
    description: "Professional Services margin percentage",
    calculation_formula:
      "((SUM(ps_revenue) - SUM(ps_costs)) * 100.0 / SUM(ps_revenue))",
    dependent_metrics: ["ps_revenue", "ps_costs"],
    unit: "%",
    target_value: 70,
    trend_direction: "neutral",
    color: "bg-orange-500",
    is_visible_on_dashboard: false,
    display_order: 8,
  },
  {
    name: "Project Go-Lives",
    description: "Number of projects successfully launched",
    calculation_formula:
      "COUNT(CASE WHEN project_status = 'go_live' THEN 1 END)",
    dependent_metrics: ["project_status"],
    unit: "projects",
    target_value: 15,
    trend_direction: "up",
    color: "bg-orange-500",
    is_visible_on_dashboard: false,
    display_order: 9,
  },

  // Product Engineering KPIs
  {
    name: "Total New Features Delivered",
    description: "Total new features delivered in the period",
    calculation_formula:
      "COUNT(CASE WHEN feature_status = 'delivered' THEN 1 END)",
    dependent_metrics: ["feature_status"],
    unit: "features",
    target_value: 32,
    trend_direction: "neutral",
    color: "bg-indigo-500",
    is_visible_on_dashboard: true,
    display_order: 10,
  },
  {
    name: "Total Release Variance",
    description: "Percentage of releases delivered on time",
    calculation_formula:
      "(COUNT(CASE WHEN release_status = 'on_time' THEN 1 END) * 100.0 / COUNT(*))",
    dependent_metrics: ["release_status"],
    unit: "%",
    target_value: 95,
    trend_direction: "up",
    color: "bg-indigo-500",
    is_visible_on_dashboard: false,
    display_order: 11,
  },
  {
    name: "Total Defect Leakage",
    description: "Percentage of defects that leaked to production",
    calculation_formula:
      "(COUNT(CASE WHEN defect_environment = 'production' THEN 1 END) * 100.0 / COUNT(*))",
    dependent_metrics: ["defect_environment"],
    unit: "%",
    target_value: 2.0,
    trend_direction: "down",
    color: "bg-indigo-500",
    is_visible_on_dashboard: false,
    display_order: 12,
  },

  // Customer Success KPIs
  {
    name: "Total ARR",
    description: "Total Annual Recurring Revenue",
    calculation_formula: "SUM(arr_amount)",
    dependent_metrics: ["arr_amount"],
    unit: "$",
    target_value: 5000000,
    trend_direction: "up",
    color: "bg-teal-500",
    is_visible_on_dashboard: true,
    display_order: 13,
  },
  {
    name: "Total Churn ARR",
    description: "Total ARR lost due to churn",
    calculation_formula:
      "SUM(CASE WHEN churn_type = 'lost' THEN arr_amount ELSE 0 END)",
    dependent_metrics: ["churn_type", "arr_amount"],
    unit: "$",
    target_value: 300000,
    trend_direction: "down",
    color: "bg-teal-500",
    is_visible_on_dashboard: true,
    display_order: 14,
  },
  {
    name: "Total Adoption %",
    description: "Percentage of customers with high adoption",
    calculation_formula:
      "(COUNT(CASE WHEN adoption_score >= 80 THEN 1 END) * 100.0 / COUNT(*))",
    dependent_metrics: ["adoption_score"],
    unit: "%",
    target_value: 85,
    trend_direction: "up",
    color: "bg-teal-500",
    is_visible_on_dashboard: false,
    display_order: 15,
  },

  // Human Resources KPIs
  {
    name: "Total Offers Made",
    description: "Total job offers made",
    calculation_formula: "COUNT(CASE WHEN offer_status = 'made' THEN 1 END)",
    dependent_metrics: ["offer_status"],
    unit: "offers",
    target_value: 40,
    trend_direction: "up",
    color: "bg-pink-500",
    is_visible_on_dashboard: false,
    display_order: 16,
  },
  {
    name: "Total Attrition",
    description: "Employee attrition rate",
    calculation_formula:
      "(COUNT(CASE WHEN employee_status = 'terminated' THEN 1 END) * 100.0 / COUNT(*))",
    dependent_metrics: ["employee_status"],
    unit: "%",
    target_value: 10.0,
    trend_direction: "down",
    color: "bg-pink-500",
    is_visible_on_dashboard: false,
    display_order: 17,
  },

  // General & Administrative KPIs
  {
    name: "Administrative Efficiency",
    description: "Overall administrative process efficiency",
    calculation_formula: "SUM(processed_requests) / SUM(total_requests) * 100",
    dependent_metrics: ["processed_requests", "total_requests"],
    unit: "%",
    target_value: 95,
    trend_direction: "up",
    color: "bg-gray-500",
    is_visible_on_dashboard: false,
    display_order: 18,
  },
  {
    name: "Compliance Score",
    description: "Overall compliance rating across all functions",
    calculation_formula: "AVG(compliance_ratings)",
    dependent_metrics: ["compliance_ratings"],
    unit: "%",
    target_value: 98,
    trend_direction: "up",
    color: "bg-gray-500",
    is_visible_on_dashboard: false,
    display_order: 19,
  },
  {
    name: "Cost per Employee",
    description: "Administrative cost per employee",
    calculation_formula: "SUM(admin_costs) / COUNT(employees)",
    dependent_metrics: ["admin_costs", "employees"],
    unit: "$",
    target_value: 2500,
    trend_direction: "down",
    color: "bg-gray-500",
    is_visible_on_dashboard: false,
    display_order: 20,
  },
];

const initiatives = [
  // Sales Initiatives
  {
    title: "Pipeline Acceleration Program",
    description:
      "Focused initiative to accelerate deal velocity and increase pipeline conversion",
    objective: "Increase pipeline velocity by 25% and improve conversion rates",
    success_criteria: "Achieve 25% faster deal cycles and 15% higher win rates",
    status: "active",
    priority: "high",
    start_date: "2025-01-01",
    target_date: "2025-06-30",
    completion_percentage: 35,
    budget_allocated: 500000,
    budget_spent: 175000,
  },
  {
    title: "New Logo Acquisition Strategy",
    description:
      "Comprehensive approach to increase new customer acquisition rates",
    objective: "Increase new logo acquisition by 40%",
    success_criteria: "Achieve 40% growth in new customer acquisition",
    status: "active",
    priority: "high",
    start_date: "2025-01-01",
    target_date: "2025-12-31",
    completion_percentage: 20,
    budget_allocated: 750000,
    budget_spent: 150000,
  },

  // Marketing Initiatives
  {
    title: "Lead Generation Optimization",
    description:
      "Comprehensive strategy to improve lead quality and quantity across all channels",
    objective: "Increase qualified leads by 50% while improving lead quality",
    success_criteria: "Achieve 50% more MQLs with 20% higher conversion rates",
    status: "active",
    priority: "high",
    start_date: "2025-01-01",
    target_date: "2025-09-30",
    completion_percentage: 45,
    budget_allocated: 600000,
    budget_spent: 270000,
  },
  {
    title: "Content Marketing Enhancement",
    description:
      "Strategic content initiatives to drive engagement and pipeline contribution",
    objective: "Improve content engagement and pipeline contribution",
    success_criteria:
      "Achieve 30% increase in content engagement and 25% pipeline contribution",
    status: "active",
    priority: "medium",
    start_date: "2025-02-01",
    target_date: "2025-08-31",
    completion_percentage: 60,
    budget_allocated: 300000,
    budget_spent: 180000,
  },

  // Professional Services Initiatives
  {
    title: "Delivery Excellence Program",
    description:
      "Improving project delivery timelines and customer satisfaction scores",
    objective: "Improve project delivery efficiency and customer satisfaction",
    success_criteria: "Achieve 95% on-time delivery and 4.5+ CSAT scores",
    status: "active",
    priority: "high",
    start_date: "2025-01-01",
    target_date: "2025-07-31",
    completion_percentage: 55,
    budget_allocated: 400000,
    budget_spent: 220000,
  },
  {
    title: "Quality Assurance Enhancement",
    description:
      "Reducing defect leakage and improving overall solution quality",
    objective: "Reduce defect leakage and improve solution quality",
    success_criteria: "Achieve <2% defect leakage and 98% quality score",
    status: "active",
    priority: "medium",
    start_date: "2025-03-01",
    target_date: "2025-10-31",
    completion_percentage: 30,
    budget_allocated: 250000,
    budget_spent: 75000,
  },

  // Product Engineering Initiatives
  {
    title: "Agile Development Acceleration",
    description:
      "Enhancing development velocity and feature delivery predictability",
    objective:
      "Increase development velocity and feature delivery predictability",
    success_criteria:
      "Achieve 30% faster development cycles and 90% on-time releases",
    status: "active",
    priority: "high",
    start_date: "2025-01-01",
    target_date: "2025-08-31",
    completion_percentage: 40,
    budget_allocated: 800000,
    budget_spent: 320000,
  },
  {
    title: "Quality Engineering Excellence",
    description:
      "Reducing defects and improving overall product quality metrics",
    objective: "Improve product quality and reduce defects",
    success_criteria: "Achieve <1% defect rate and 99% test coverage",
    status: "active",
    priority: "high",
    start_date: "2025-02-01",
    target_date: "2025-09-30",
    completion_percentage: 50,
    budget_allocated: 500000,
    budget_spent: 250000,
  },

  // Customer Success Initiatives
  {
    title: "Churn Prevention & Risk Mitigation",
    description:
      "Proactive strategies to identify and prevent customer churn risks",
    objective: "Reduce customer churn and improve retention",
    success_criteria: "Achieve <5% annual churn rate and 95% retention",
    status: "active",
    priority: "high",
    start_date: "2025-01-01",
    target_date: "2025-12-31",
    completion_percentage: 25,
    budget_allocated: 350000,
    budget_spent: 87500,
  },
  {
    title: "Revenue Expansion Initiative",
    description:
      "Focused efforts to drive net revenue retention through upselling and expansion",
    objective: "Increase net revenue retention through expansion",
    success_criteria: "Achieve 120% net revenue retention",
    status: "active",
    priority: "medium",
    start_date: "2025-03-01",
    target_date: "2025-11-30",
    completion_percentage: 35,
    budget_allocated: 200000,
    budget_spent: 70000,
  },

  // Human Resources Initiatives
  {
    title: "Talent Acquisition Excellence",
    description:
      "Streamlining recruitment processes and improving candidate experience",
    objective: "Improve recruitment efficiency and candidate experience",
    success_criteria:
      "Achieve 30% faster time-to-hire and 90% candidate satisfaction",
    status: "active",
    priority: "high",
    start_date: "2025-01-01",
    target_date: "2025-06-30",
    completion_percentage: 65,
    budget_allocated: 300000,
    budget_spent: 195000,
  },
  {
    title: "Employee Retention & Engagement",
    description:
      "Comprehensive initiatives to improve retention rates and employee satisfaction",
    objective: "Improve employee retention and engagement",
    success_criteria: "Achieve 90% retention rate and 85% engagement score",
    status: "active",
    priority: "medium",
    start_date: "2025-02-01",
    target_date: "2025-12-31",
    completion_percentage: 40,
    budget_allocated: 250000,
    budget_spent: 100000,
  },

  // General & Administrative Initiatives
  {
    title: "Process Optimization Initiative",
    description:
      "Streamlining administrative processes and improving operational efficiency",
    objective: "Improve administrative efficiency and reduce processing time",
    success_criteria: "Achieve 95% process efficiency and 30% faster processing",
    status: "active",
    priority: "medium",
    start_date: "2025-01-01",
    target_date: "2025-08-31",
    completion_percentage: 45,
    budget_allocated: 200000,
    budget_spent: 90000,
  },
  {
    title: "Compliance Enhancement Program",
    description:
      "Strengthening compliance frameworks and audit readiness across all functions",
    objective: "Enhance compliance posture and audit readiness",
    success_criteria: "Achieve 98% compliance score and zero audit findings",
    status: "active",
    priority: "high",
    start_date: "2025-02-01",
    target_date: "2025-10-31",
    completion_percentage: 30,
    budget_allocated: 150000,
    budget_spent: 45000,
  },
];

const employees = [
  {
    employee_code: "EMP001",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@innovapptive.com",
    designation: "Sales Manager",
    business_unit_name: "Sales",
    team: "Enterprise Sales",
    skill: "Sales Strategy",
    manager_email: "sarah.johnson@innovapptive.com",
    hire_date: "2023-01-15",
    role: "manager",
    is_active: true,
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
  },
  {
    employee_code: "EMP002",
    first_name: "Emily",
    last_name: "Davis",
    email: "emily.davis@innovapptive.com",
    designation: "Marketing Specialist",
    business_unit_name: "Marketing",
    team: "Digital Marketing",
    skill: "Content Marketing",
    manager_email: "michael.brown@innovapptive.com",
    hire_date: "2023-03-20",
    role: "employee",
    is_active: true,
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
  },
  {
    employee_code: "EMP003",
    first_name: "David",
    last_name: "Wilson",
    email: "david.wilson@innovapptive.com",
    designation: "Software Engineer",
    business_unit_name: "Product & Engineering",
    team: "Platform Engineering",
    skill: "Full Stack Development",
    manager_email: "lisa.rodriguez@innovapptive.com",
    hire_date: "2022-11-10",
    role: "employee",
    is_active: true,
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
  },
  {
    employee_code: "EMP004",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@innovapptive.com",
    designation: "Sales Director",
    business_unit_name: "Sales",
    team: "Sales Leadership",
    skill: "Strategic Sales",
    manager_email: "ceo@innovapptive.com",
    hire_date: "2022-05-10",
    role: "manager",
    is_active: true,
    phone: "+1 (555) 456-7890",
    location: "New York, NY",
  },
  {
    employee_code: "EMP005",
    first_name: "Michael",
    last_name: "Brown",
    email: "michael.brown@innovapptive.com",
    designation: "Marketing Director",
    business_unit_name: "Marketing",
    team: "Marketing Leadership",
    skill: "Digital Strategy",
    manager_email: "ceo@innovapptive.com",
    hire_date: "2022-08-15",
    role: "manager",
    is_active: true,
    phone: "+1 (555) 567-8901",
    location: "San Francisco, CA",
  },
  {
    employee_code: "EMP006",
    first_name: "Lisa",
    last_name: "Rodriguez",
    email: "lisa.rodriguez@innovapptive.com",
    designation: "Engineering Director",
    business_unit_name: "Product & Engineering",
    team: "Engineering Leadership",
    skill: "Technical Leadership",
    manager_email: "cto@innovapptive.com",
    hire_date: "2022-03-01",
    role: "manager",
    is_active: true,
    phone: "+1 (555) 678-9012",
    location: "Austin, TX",
  },
  {
    employee_code: "EMP007",
    first_name: "Jennifer",
    last_name: "Martinez",
    email: "jennifer.martinez@innovapptive.com",
    designation: "Customer Success Manager",
    business_unit_name: "Customer Success",
    team: "Customer Success",
    skill: "Customer Relationship Management",
    manager_email: "director@innovapptive.com",
    hire_date: "2023-06-12",
    role: "manager",
    is_active: true,
    phone: "+1 (555) 789-0123",
    location: "Chicago, IL",
  },
  {
    employee_code: "EMP008",
    first_name: "Robert",
    last_name: "Thompson",
    email: "robert.thompson@innovapptive.com",
    designation: "Professional Services Manager",
    business_unit_name: "Professional Services",
    team: "Delivery Team",
    skill: "Project Management",
    manager_email: "director@innovapptive.com",
    hire_date: "2023-02-28",
    role: "manager",
    is_active: true,
    phone: "+1 (555) 890-1234",
    location: "Denver, CO",
  },
  {
    employee_code: "EMP009",
    first_name: "Amanda",
    last_name: "White",
    email: "amanda.white@innovapptive.com",
    designation: "HR Manager",
    business_unit_name: "Human Resources",
    team: "People Operations",
    skill: "Talent Management",
    manager_email: "chro@innovapptive.com",
    hire_date: "2022-12-05",
    role: "manager",
    is_active: true,
    phone: "+1 (555) 901-2345",
    location: "Seattle, WA",
  },
  {
    employee_code: "EMP010",
    first_name: "James",
    last_name: "Anderson",
    email: "james.anderson@innovapptive.com",
    designation: "Sales Representative",
    business_unit_name: "Sales",
    team: "Enterprise Sales",
    skill: "B2B Sales",
    manager_email: "john.smith@innovapptive.com",
    hire_date: "2023-09-18",
    role: "employee",
    is_active: true,
    phone: "+1 (555) 012-3456",
    location: "Boston, MA",
  },
  {
    employee_code: "EMP011",
    first_name: "Maria",
    last_name: "Garcia",
    email: "maria.garcia@innovapptive.com",
    designation: "Marketing Coordinator",
    business_unit_name: "Marketing",
    team: "Digital Marketing",
    skill: "Social Media Marketing",
    manager_email: "emily.davis@innovapptive.com",
    hire_date: "2023-11-22",
    role: "employee",
    is_active: true,
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
  },
  {
    employee_code: "EMP012",
    first_name: "Christopher",
    last_name: "Lee",
    email: "christopher.lee@innovapptive.com",
    designation: "Software Developer",
    business_unit_name: "Product & Engineering",
    team: "Platform Engineering",
    skill: "Backend Development",
    manager_email: "david.wilson@innovapptive.com",
    hire_date: "2023-07-03",
    role: "employee",
    is_active: true,
    phone: "+1 (555) 234-5678",
    location: "Portland, OR",
  },
];

const actionItems = [
  // Sales Action Items
  {
    title: "Implement sales enablement training program",
    description: "Develop and deploy comprehensive sales training program",
    action_type: "task",
    status: "in_progress",
    priority: "high",
    estimated_hours: 80,
    actual_hours: 45,
    due_date: "2025-02-20",
    tags: ["training", "sales-enablement"],
  },
  {
    title: "Deploy advanced lead scoring model",
    description: "Implement AI-powered lead scoring system",
    action_type: "deliverable",
    status: "not_started",
    priority: "medium",
    estimated_hours: 120,
    actual_hours: 0,
    due_date: "2025-03-10",
    tags: ["ai", "lead-scoring"],
  },
  {
    title: "Launch partner referral program",
    description: "Establish partner referral incentives and processes",
    action_type: "milestone",
    status: "completed",
    priority: "high",
    estimated_hours: 60,
    actual_hours: 60,
    due_date: "2025-01-15",
    completed_date: "2025-01-15",
    tags: ["partnerships", "referrals"],
  },

  // Marketing Action Items
  {
    title: "Launch ABM campaign for enterprise accounts",
    description:
      "Execute account-based marketing campaign for top 50 enterprise accounts",
    action_type: "task",
    status: "in_progress",
    priority: "high",
    estimated_hours: 100,
    actual_hours: 65,
    due_date: "2025-02-25",
    tags: ["abm", "enterprise"],
  },
  {
    title: "Optimize website conversion funnel",
    description:
      "Improve website conversion rates through A/B testing and optimization",
    action_type: "deliverable",
    status: "not_started",
    priority: "medium",
    estimated_hours: 80,
    actual_hours: 0,
    due_date: "2025-03-15",
    tags: ["conversion", "optimization"],
  },
  {
    title: "Develop industry-specific case studies",
    description: "Create compelling case studies for key industry verticals",
    action_type: "deliverable",
    status: "completed",
    priority: "medium",
    estimated_hours: 40,
    actual_hours: 40,
    due_date: "2025-01-20",
    completed_date: "2025-01-20",
    tags: ["content", "case-studies"],
  },

  // Professional Services Action Items
  {
    title: "Implement standardized project templates",
    description: "Create and deploy standardized project management templates",
    action_type: "deliverable",
    status: "in_progress",
    priority: "high",
    estimated_hours: 60,
    actual_hours: 35,
    due_date: "2025-02-18",
    tags: ["templates", "project-management"],
  },
  {
    title: "Establish client communication protocols",
    description: "Define and implement client communication standards",
    action_type: "task",
    status: "completed",
    priority: "medium",
    estimated_hours: 30,
    actual_hours: 30,
    due_date: "2025-01-25",
    completed_date: "2025-01-25",
    tags: ["communication", "protocols"],
  },
  {
    title: "Deploy automated testing framework",
    description:
      "Implement comprehensive automated testing for all deliverables",
    action_type: "deliverable",
    status: "in_progress",
    priority: "high",
    estimated_hours: 120,
    actual_hours: 75,
    due_date: "2025-03-08",
    tags: ["automation", "testing"],
  },

  // Product Engineering Action Items
  {
    title: "Implement CI/CD pipeline improvements",
    description: "Enhance continuous integration and deployment pipeline",
    action_type: "deliverable",
    status: "in_progress",
    priority: "high",
    estimated_hours: 100,
    actual_hours: 60,
    due_date: "2025-02-22",
    tags: ["ci-cd", "automation"],
  },
  {
    title: "Adopt advanced sprint planning techniques",
    description: "Implement advanced agile sprint planning methodologies",
    action_type: "task",
    status: "not_started",
    priority: "medium",
    estimated_hours: 40,
    actual_hours: 0,
    due_date: "2025-03-12",
    tags: ["agile", "sprint-planning"],
  },
  {
    title: "Expand automated test coverage to 85%",
    description: "Increase automated test coverage across all codebases",
    action_type: "milestone",
    status: "in_progress",
    priority: "high",
    estimated_hours: 150,
    actual_hours: 90,
    due_date: "2025-03-20",
    tags: ["testing", "coverage"],
  },

  // Customer Success Action Items
  {
    title: "Deploy predictive churn analytics model",
    description: "Implement AI-powered churn prediction system",
    action_type: "deliverable",
    status: "in_progress",
    priority: "high",
    estimated_hours: 120,
    actual_hours: 80,
    due_date: "2025-02-28",
    tags: ["analytics", "churn-prediction"],
  },
  {
    title: "Create executive engagement program for at-risk accounts",
    description:
      "Develop executive-level engagement strategy for high-risk customers",
    action_type: "task",
    status: "not_started",
    priority: "high",
    estimated_hours: 60,
    actual_hours: 0,
    due_date: "2025-03-15",
    tags: ["executive-engagement", "at-risk"],
  },
  {
    title: "Launch customer success-driven expansion campaigns",
    description:
      "Execute expansion campaigns based on customer success insights",
    action_type: "task",
    status: "in_progress",
    priority: "medium",
    estimated_hours: 80,
    actual_hours: 45,
    due_date: "2025-03-10",
    tags: ["expansion", "customer-success"],
  },

  // Human Resources Action Items
  {
    title: "Implement AI-powered candidate screening",
    description: "Deploy AI-based candidate screening and assessment tools",
    action_type: "deliverable",
    status: "in_progress",
    priority: "high",
    estimated_hours: 100,
    actual_hours: 65,
    due_date: "2025-03-05",
    tags: ["ai", "recruitment"],
  },
  {
    title: "Launch employer branding campaign",
    description: "Execute comprehensive employer branding campaign",
    action_type: "task",
    status: "not_started",
    priority: "medium",
    estimated_hours: 60,
    actual_hours: 0,
    due_date: "2025-03-25",
    tags: ["employer-branding", "recruitment"],
  },
  {
    title: "Deploy quarterly pulse surveys",
    description: "Implement quarterly employee engagement pulse surveys",
    action_type: "task",
    status: "completed",
    priority: "medium",
    estimated_hours: 20,
    actual_hours: 20,
    due_date: "2025-02-10",
    completed_date: "2025-02-10",
    tags: ["engagement", "surveys"],
  },

  // General & Administrative Action Items
  {
    title: "Implement document management system",
    description: "Deploy centralized document management and version control",
    action_type: "deliverable",
    status: "in_progress",
    priority: "high",
    estimated_hours: 80,
    actual_hours: 50,
    due_date: "2025-02-28",
    tags: ["document-management", "efficiency"],
  },
  {
    title: "Conduct quarterly compliance audit",
    description: "Perform comprehensive compliance review and assessment",
    action_type: "task",
    status: "not_started",
    priority: "high",
    estimated_hours: 40,
    actual_hours: 0,
    due_date: "2025-03-15",
    tags: ["compliance", "audit"],
  },
  {
    title: "Optimize administrative cost structure",
    description: "Review and optimize administrative expenses and processes",
    action_type: "task",
    status: "in_progress",
    priority: "medium",
    estimated_hours: 60,
    actual_hours: 25,
    due_date: "2025-03-20",
    tags: ["cost-optimization", "efficiency"],
  },
];

export async function populateDatabase() {
  try {
    console.log("Starting database population...");
    // 1. Insert business units
    console.log("Inserting business units...");
    const { data: businessUnitsData, error: buError } = await supabase
      .from("business_units")
      .insert(
        businessUnits.map((bu) => ({
          ...bu,
          manager_id: null, // Will be set when we have actual users
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      )
      .select();

    if (buError) {
      console.error("Error inserting business units:", buError);
      return;
    }

    console.log("Business units inserted:", businessUnitsData);

    // 2. Insert KPI definitions
    console.log("Inserting KPI definitions...");
    const kpiDefinitionsWithBusinessUnits = kpiDefinitions.map((kpi, index) => {
      const businessUnitIndex = Math.floor(index / 3); // 3 KPIs per business unit
      const businessUnit = businessUnitsData[businessUnitIndex];
      return {
        ...kpi,
        business_unit_id: businessUnit.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null, // Will be set when we have actual users
      };
    });

    const { data: kpiData, error: kpiError } = await supabase
      .from("kpi_definitions")
      .insert(kpiDefinitionsWithBusinessUnits)
      .select();

    if (kpiError) {
      console.error("Error inserting KPI definitions:", kpiError);
      return;
    }

    console.log("KPI definitions inserted:", kpiData);

    // 3. Insert initiatives
    console.log("Inserting initiatives...");
    const initiativesWithBusinessUnits = initiatives.map(
      (initiative, index) => {
        const businessUnitIndex = Math.floor(index / 2); // 2 initiatives per business unit
        const businessUnit = businessUnitsData[businessUnitIndex];
        return {
          ...initiative,
          business_unit_id: businessUnit.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: null, // Will be set when we have actual users
          sponsor_id: null, // Will be set when we have actual users
          created_by: null, // Will be set when we have actual users
        };
      }
    );

    const { data: initiativesData, error: initiativesError } = await supabase
      .from("initiatives")
      .insert(initiativesWithBusinessUnits)
      .select();

    if (initiativesError) {
      console.error("Error inserting initiatives:", initiativesError);
      return;
    }

    console.log("Initiatives inserted:", initiativesData);

    // 4. Insert action items
    console.log("Inserting action items...");
    const actionItemsWithInitiatives = actionItems.map((action, index) => {
      const initiativeIndex = Math.floor(index / 3); // 3 action items per initiative
      const initiative = initiativesData[initiativeIndex];
      const businessUnitIndex = Math.floor(initiativeIndex / 2); // 2 initiatives per business unit
      const businessUnit = businessUnitsData[businessUnitIndex];
      return {
        ...action,
        initiative_id: initiative.id,
        business_unit_id: businessUnit.id,
        assigned_to: null, // Will be set when we have actual users
        created_by: null, // Will be set when we have actual users
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dependencies: [], // Empty array for dependencies
        attachments: [], // Empty array for attachments
        comments: [], // Empty array for comments
      };
    });

    const { data: actionItemsData, error: actionItemsError } = await supabase
      .from("action_items")
      .insert(actionItemsWithInitiatives)
      .select();

    if (actionItemsError) {
      console.error("Error inserting action items:", actionItemsError);
      return;
    }

    console.log("Action items inserted:", actionItemsData);

    // 5. Insert calculated KPI values
    console.log("Inserting calculated KPI values...");
    const calculatedKPIs = kpiData.map((kpi) => {
      const currentValue = Math.floor(
        kpi.target_value * (0.8 + Math.random() * 0.4)
      ); // Random value between 80-120% of target
      return {
        kpi_definition_id: kpi.id,
        business_unit_id: kpi.business_unit_id,
        calculated_value: currentValue,
        target_value: kpi.target_value,
        previous_value: Math.floor(currentValue * (0.9 + Math.random() * 0.2)), // Random previous value
        calculation_month: new Date().getMonth() + 1,
        calculation_year: new Date().getFullYear(),
        calculation_period: "monthly",
        trend:
          currentValue > kpi.target_value
            ? "up"
            : currentValue < kpi.target_value * 0.9
            ? "down"
            : "neutral",
        variance_percentage:
          ((currentValue - kpi.target_value) / kpi.target_value) * 100,
        calculation_metadata: {}, // Empty object for metadata
        calculated_at: new Date().toISOString(),
        calculated_by: null, // Will be set when we have actual users
      };
    });

    const { data: calculatedKPIsData, error: calculatedKPIsError } =
      await supabase.from("calculated_kpis").insert(calculatedKPIs).select();

    if (calculatedKPIsError) {
      console.error("Error inserting calculated KPIs:", calculatedKPIsError);
      return;
    }

    console.log("Calculated KPIs inserted:", calculatedKPIsData);

    // 6. Insert employee profiles
    console.log("Inserting employee profiles...");
    const employeesWithBusinessUnits = employees.map((employee) => {
      // Find the business unit by name
      const businessUnit = businessUnitsData.find(
        (bu) => bu.name === employee.business_unit_name
      );

      // Find manager by email (if exists)
      const manager = employees.find(
        (emp) => emp.email === employee.manager_email
      );

      return {
        employee_id: employee.employee_code,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        job_title: employee.designation,
        department: employee.team,
        business_unit_id: businessUnit?.id || null,
        hire_date: employee.hire_date,
        role: employee.role,
        is_active: employee.is_active,
        phone: employee.phone,
        location: employee.location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const { data: employeesData, error: employeesError } = await supabase
      .from("employee_profiles")
      .insert(employeesWithBusinessUnits)
      .select();

    if (employeesError) {
      console.error("Error inserting employee profiles:", employeesError);
      return;
    }

    console.log("Employee profiles inserted:", employeesData);

    console.log("✅ Database population completed successfully!");
    console.log("Summary:");
    console.log(`- ${businessUnitsData.length} business units`);
    console.log(`- ${kpiData.length} KPI definitions`);
    console.log(`- ${initiativesData.length} initiatives`);
    console.log(`- ${actionItemsData.length} action items`);
    console.log(`- ${calculatedKPIsData.length} calculated KPI values`);
    console.log(`- ${employeesData.length} employee profiles`);

    // Note: RLS policies remain active for security
    console.log("🔒 RLS policies remain active for data security");
  } catch (error) {
    console.error("Error populating database:", error);
  }
}

// Run the population script
if (typeof window === "undefined") {
  // Only run in Node.js environment
  populateDatabase();
}
