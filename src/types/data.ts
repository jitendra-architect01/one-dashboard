// KPI Category definitions for EPICG framework
export type KPICategory = 'Economics' | 'People' | 'Innovation' | 'Customer' | 'Growth';

export interface KPICategoryInfo {
  id: KPICategory;
  label: string;
  shortForm: string;
  color: string;
}

export const KPI_CATEGORIES: Record<string, KPICategoryInfo> = {
  ECONOMICS: {
    id: 'Economics',
    label: 'Economics',
    shortForm: 'E',
    color: 'bg-blue-500'
  },
  PEOPLE: {
    id: 'People',
    label: 'People',
    shortForm: 'P',
    color: 'bg-green-500'
  },
  INNOVATION: {
    id: 'Innovation',
    label: 'Innovation',
    shortForm: 'I',
    color: 'bg-purple-500'
  },
  CUSTOMER: {
    id: 'Customer',
    label: 'Customer',
    shortForm: 'C',
    color: 'bg-orange-500'
  },
  GROWTH: {
    id: 'Growth',
    label: 'Growth',
    shortForm: 'G',
    color: 'bg-red-500'
  }
};

export const KPI_CATEGORY_ORDER: KPICategory[] = ['Economics', 'People', 'Innovation', 'Customer', 'Growth'];

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