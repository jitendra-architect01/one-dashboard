import React, { createContext, useContext, ReactNode } from "react";
import { useSupabaseData } from "../hooks/useSupabaseData";
import type {
  KPIData,
  InitiativeData,
  BusinessUnitData,
  BusinessUnitSummary,
} from "../hooks/useSupabaseData";

export interface DataContextType {
  businessUnits: Record<string, BusinessUnitData>;
  businessUnitsArray: BusinessUnitSummary[];
  getAllKPIs: () => KPIData[];
  toggleKPIVisibility: (businessUnit: string, kpiId: string) => Promise<void>;
  updateKPIs: () => void;
  updateInitiatives: () => void;
  addKPI: (unit: string, kpi: Omit<KPIData, "id">) => Promise<void>;
  updateKPI: (
    businessUnit: string,
    kpiId: string,
    updates: Partial<KPIData>
  ) => Promise<void>;
  deleteKPI: (unit: string, id: string) => Promise<void>;
  addInitiative: (
    unit: string,
    initiative: Omit<InitiativeData, "id">
  ) => Promise<void>;
  updateInitiative: (
    businessUnit: string,
    initiativeId: string,
    updates: Partial<InitiativeData>
  ) => Promise<void>;
  deleteInitiative: (unit: string, id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const supabaseData = useSupabaseData();

  // Transform array data to object format for backward compatibility
  const businessUnits = supabaseData.businessUnits.reduce((acc, bu) => {
    acc[bu.code] = bu;
    return acc;
  }, {} as Record<string, BusinessUnitData>);

  const getAllKPIs = () => {
    return supabaseData.businessUnits.flatMap((bu) =>
      bu.kpis.map((kpi) => ({
        ...kpi,
        businessUnit: bu.code,
        businessUnitName: bu.name,
      }))
    );
  };

  const updateKPIs = () => {
    console.log("updateKPIs called - implement state update and Supabase sync");
  };

  const updateInitiatives = () => {
    console.log(
      "updateInitiatives called - implement state update and Supabase sync"
    );
  };

  const contextValue: DataContextType = {
    businessUnits,
    businessUnitsArray: supabaseData.businessUnitsArray,
    getAllKPIs,
    toggleKPIVisibility: supabaseData.toggleKPIVisibility,
    updateKPIs,
    updateInitiatives,
    addKPI: supabaseData.addKPI,
    updateKPI: supabaseData.updateKPI,
    deleteKPI: supabaseData.deleteKPI,
    addInitiative: supabaseData.addInitiative,
    updateInitiative: supabaseData.updateInitiative,
    deleteInitiative: supabaseData.deleteInitiative,
    loading: supabaseData.loading,
    error: supabaseData.error,
    refetch: supabaseData.refetch,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
