export type KPITrend = "up" | "down" | "neutral";

export type KPIPeriod = "monthly" | "quarterly" | "yearly";

export type KPICategory = "Economics" | "People" | "Innovation" | "Customer" | "Growth";

export interface KPIData {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  period: string;
  trend: string;
  color: string;
  isVisibleOnDashboard: boolean;
  businessUnit: string;
  businessUnitName: string;
}

export interface ActionItemData {
  id: string;
  action: string;
  owner: string;
  status: "Not Started" | "In Progress" | "Completed" | "Blocked";
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  team: string;
}

export interface InitiativeData {
  id: string;
  title: string;
  description: string;
  actionItems: ActionItemData[];
}

export interface BusinessUnitData {
  id: string;
  code: string;
  name: string;
  kpis: KPIData[];
  initiatives: InitiativeData[];
}

export interface BusinessUnitSummary {
  id: string;
  name: string;
  kpiCount: number;
  actionCount: number;
  path: string;
}

export interface DataSchema {
  requiredColumns: string[];
  calculations: Record<string, string>;
}

export interface ExcelData {
  businessUnit: string;
  data: unknown[];
  month: string;
  year: string;
}

export interface KPIVisibilityUpdate {
  businessUnit: string;
  kpiId: string;
  isVisible: boolean;
}

export interface KPIUpdate {
  businessUnit: string;
  kpiId: string;
  updates: Partial<KPIData>;
}

export interface InitiativeUpdate {
  businessUnit: string;
  initiativeId: string;
  updates: Partial<InitiativeData>;
}

export interface DataContextType {
  businessUnits: {
    sales: BusinessUnitData;
    marketing: BusinessUnitData;
    professionalServices: BusinessUnitData;
    productEngineering: BusinessUnitData;
    customerSuccess: BusinessUnitData;
    humanResources: BusinessUnitData;
  };
  businessUnitsArray: BusinessUnitSummary[];
  getAllKPIs: () => Array<
    KPIData & { businessUnit: string; businessUnitName: string }
  >;
  toggleKPIVisibility: (businessUnit: string, kpiId: string) => void;
  updateKPIs: (unit: string, kpis: KPIData[]) => void;
  updateInitiatives: (unit: string, initiatives: InitiativeData[]) => void;
  addKPI: (unit: string, kpi: Omit<KPIData, "id">) => void;
  updateKPI: (
    businessUnit: string,
    kpiId: string,
    updates: Partial<KPIData>
  ) => void;
  deleteKPI: (unit: string, id: string) => void;
  addInitiative: (
    unit: string,
    initiative: Omit<InitiativeData, "id">
  ) => void;
  updateInitiative: (
    businessUnit: string,
    initiativeId: string,
    updates: Partial<InitiativeData>
  ) => void;
  deleteInitiative: (unit: string, id: string) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
