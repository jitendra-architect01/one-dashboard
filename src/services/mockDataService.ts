import type { KPIData, InitiativeData, BusinessUnitData } from "../hooks/useSupabaseData";

// Mock Sales KPIs with the requested names
export const mockSalesKPIs = [
  {
    id: "1",
    name: "Year 1 ARR Net Pipeline",
    current: 2850000,
    target: 2540000,
    unit: "$",
    period: "Q4 2025",
    trend: "up",
    color: "bg-green-500",
    isVisibleOnDashboard: true,
    businessUnit: "sales",
    businessUnitName: "Sales",
  },
  {
    id: "2",
    name: "Total ARR Pipeline",
    current: 4200000,
    target: 4000000,
    unit: "$",
    period: "Q4 2025",
    trend: "up",
    color: "bg-blue-500",
    isVisibleOnDashboard: true,
    businessUnit: "sales",
    businessUnitName: "Sales",
  },
  {
    id: "3",
    name: "Year 1 ARR Weighted Pipeline",
    current: 1800000,
    target: 1600000,
    unit: "$",
    period: "Q4 2025",
    trend: "up",
    color: "bg-indigo-500",
    isVisibleOnDashboard: true,
    businessUnit: "sales",
    businessUnitName: "Sales",
  },
  {
    id: "4",
    name: "Year 1 ARR Won",
    current: 950000,
    target: 800000,
    unit: "$",
    period: "Q4 2025",
    trend: "up",
    color: "bg-purple-500",
    isVisibleOnDashboard: true,
    businessUnit: "sales",
    businessUnitName: "Sales",
  },
  {
    id: "5",
    name: "Total ARR Won",
    current: 1200000,
    target: 1000000,
    unit: "$",
    period: "Q4 2025",
    trend: "up",
    color: "bg-teal-500",
    isVisibleOnDashboard: true,
    businessUnit: "sales",
    businessUnitName: "Sales",
  },
  {
    id: "6",
    name: "New Logos Won",
    current: 28,
    target: 25,
    unit: "number",
    period: "Q4 2025",
    trend: "up",
    color: "bg-orange-500",
    isVisibleOnDashboard: true,
    businessUnit: "sales",
    businessUnitName: "Sales",
  },
  {
    id: "7",
    name: "Win Rate",
    current: 68,
    target: 65,
    unit: "%",
    period: "Q4 2025",
    trend: "up",
    color: "bg-pink-500",
    isVisibleOnDashboard: true,
    businessUnit: "sales",
    businessUnitName: "Sales",
  },
];

// Mock Sales initiatives
const mockSalesInitiatives: InitiativeData[] = [
  {
    id: "sales-initiative-1",
    title: "Pipeline Development Strategy",
    description: "Focus on building and maintaining a robust sales pipeline to achieve ARR targets.",
    actionItems: [
      {
        id: "sales-action-1",
        action: "Review current pipeline health",
        owner: "Sales Director",
        status: "In Progress",
        dueDate: "2024-12-31",
        priority: "High",
        team: "sales"
      },
      {
        id: "sales-action-2",
        action: "Implement lead scoring system",
        owner: "Sales Manager",
        status: "Not Started",
        dueDate: "2025-01-15",
        priority: "Medium",
        team: "sales"
      }
    ]
  },
  {
    id: "sales-initiative-2",
    title: "Win Rate Optimization",
    description: "Improve conversion rates and win rates through better sales processes and training.",
    actionItems: [
      {
        id: "sales-action-3",
        action: "Conduct sales training sessions",
        owner: "Sales Trainer",
        status: "Not Started",
        dueDate: "2025-01-30",
        priority: "High",
        team: "sales"
      }
    ]
  }
];

// Mock business unit data
export const mockBusinessUnits: Record<string, BusinessUnitData> = {
  sales: {
    id: "sales-mock",
    code: "sales",
    name: "Sales",
    kpis: mockSalesKPIs,
    initiatives: mockSalesInitiatives
  }
};

// Function to get mock KPIs for a specific business unit
export const getMockKPIs = (businessUnitCode: string): KPIData[] => {
  switch (businessUnitCode) {
    case "sales":
      return mockSalesKPIs;
    default:
      return [];
  }
};

// Function to get mock initiatives for a specific business unit
export const getMockInitiatives = (businessUnitCode: string): InitiativeData[] => {
  switch (businessUnitCode) {
    case "sales":
      return mockSalesInitiatives;
    default:
      return [];
  }
};

// Function to get all mock KPIs
export const getAllMockKPIs = (): KPIData[] => {
  return mockSalesKPIs;
};
