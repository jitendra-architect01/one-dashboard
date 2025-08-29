// KPI Category definitions for frequency-based tracking
export type KPICategory = 'Weekly' | 'Monthly' | 'Quarterly';

export interface KPICategoryInfo {
  id: KPICategory;
  label: string;
  shortForm: string;
  color: string;
}

export const KPI_CATEGORIES: Record<string, KPICategoryInfo> = {
  WEEKLY: {
    id: 'Weekly',
    label: 'Weekly',
    shortForm: 'W',
    color: 'bg-blue-500'
  },
  MONTHLY: {
    id: 'Monthly',
    label: 'Monthly',
    shortForm: 'M',
    color: 'bg-green-500'
  },
  QUARTERLY: {
    id: 'Quarterly',
    label: 'Quarterly',
    shortForm: 'Q',
    color: 'bg-orange-500'
  }
};

export const KPI_CATEGORY_ORDER: KPICategory[] = ['Weekly', 'Monthly', 'Quarterly'];

// Data context type definition
export interface DataContextType {
  businessUnits: Record<string, any>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleKPIVisibility: (businessUnit: string, kpiId: string) => Promise<void>;
  updateKPI: (businessUnit: string, kpiId: string, updates: any) => Promise<void>;
  addKPI: (businessUnit: string, kpi: any) => Promise<void>;
  deleteKPI: (businessUnit: string, kpiId: string) => Promise<void>;
  addInitiative: (businessUnit: string, initiative: any) => Promise<void>;
  updateInitiative: (businessUnit: string, initiativeId: string, updates: any) => Promise<void>;
  deleteInitiative: (businessUnit: string, initiativeId: string) => Promise<void>;
  updateActionItem: (actionItemId: string, updates: any) => Promise<void>;
}