import { useState, useEffect, useCallback } from "react";
import { DataService } from "../services/dataService";
import type { KPIDefinition, Initiative } from "../lib/supabase";

// Frontend-friendly data interfaces
export interface KPIData {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  period: string;
  trend: "up" | "down" | "neutral";
  color: string;
  isVisibleOnDashboard: boolean;
  businessUnit: string;
  businessUnitName: string;
  monthlyData?: number[];
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

export interface SupabaseData {
  businessUnits: BusinessUnitData[];
  businessUnitsArray: BusinessUnitSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleKPIVisibility: (businessUnit: string, kpiId: string) => Promise<void>;
  updateKPI: (
    businessUnit: string,
    kpiId: string,
    updates: Partial<KPIData>
  ) => Promise<void>;
  addKPI: (businessUnit: string, kpi: Omit<KPIData, "id">) => Promise<void>;
  deleteKPI: (businessUnit: string, kpiId: string) => Promise<void>;
  addInitiative: (
    businessUnit: string,
    initiative: Omit<InitiativeData, "id">
  ) => Promise<void>;
  updateInitiative: (
    businessUnit: string,
    initiativeId: string,
    updates: Partial<InitiativeData>
  ) => Promise<void>;
  deleteInitiative: (
    businessUnit: string,
    initiativeId: string
  ) => Promise<void>;
}

export const useSupabaseData = (): SupabaseData => {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching all data from Supabase...");

      // Fetch all data in parallel
      const [businessUnitsData, kpiDefinitions, initiatives, actionItems] =
        await Promise.all([
          DataService.fetchAllBusinessUnits(),
          DataService.fetchKPIDefinitions(),
          DataService.fetchInitiatives(),
          DataService.fetchActionItems(),
        ]);

      // Transform data to frontend format
      const transformedBusinessUnits: BusinessUnitData[] =
        businessUnitsData.map((bu) => {
          // Get KPIs for this business unit
          const unitKPIs: KPIData[] = kpiDefinitions
            .filter((kpi) => kpi.business_unit_id === bu.id)
            .map((kpi) => ({
              id: kpi.id,
              name: kpi.name,
              current: kpi.target_value || 0,
              target: kpi.target_value || 0,
              unit: kpi.unit || "",
              period: `${
                new Date().getMonth() + 1
              }/${new Date().getFullYear()}`,
              trend: kpi.trend_direction || "neutral",
              color: kpi.color || "bg-gray-500",
              isVisibleOnDashboard: kpi.is_visible_on_dashboard || false,
              businessUnit: bu.code,
              businessUnitName: bu.name,
            }));

          // Get initiatives for this business unit
          const unitInitiatives: InitiativeData[] = initiatives
            .filter((init) => init.business_unit_id === bu.id)
            .map((init) => {
              // Get action items for this initiative
              const initiativeActionItems: ActionItemData[] = actionItems
                .filter((action) => action.initiative_id === init.id)
                .map((action) => ({
                  id: action.id,
                  action: action.title,
                  owner: action.assigned_to || "Unassigned",
                  status:
                    action.status === "completed"
                      ? "Completed"
                      : action.status === "in_progress"
                      ? "In Progress"
                      : action.status === "blocked"
                      ? "Blocked"
                      : "Not Started",
                  dueDate: action.due_date || "No due date",
                  priority:
                    action.priority === "critical"
                      ? "Critical"
                      : action.priority === "high"
                      ? "High"
                      : action.priority === "medium"
                      ? "Medium"
                      : "Low",
                  team: "General",
                }));

              return {
                id: init.id,
                title: init.title,
                description: init.description || "",
                actionItems: initiativeActionItems,
              };
            });

          return {
            id: bu.id,
            code: bu.code,
            name: bu.name,
            kpis: unitKPIs,
            initiatives: unitInitiatives,
          };
        });

      setBusinessUnits(transformedBusinessUnits);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleKPIVisibility = useCallback(
    async (businessUnit: string, kpiId: string) => {
      try {
        const businessUnitData = businessUnits.find(
          (bu) => bu.code === businessUnit
        );
        const kpi = businessUnitData?.kpis.find((k) => k.id === kpiId);
        if (!kpi) return;

        await DataService.toggleKPIVisibility(kpiId, !kpi.isVisibleOnDashboard);

        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  kpis: bu.kpis.map((k) =>
                    k.id === kpiId
                      ? { ...k, isVisibleOnDashboard: !k.isVisibleOnDashboard }
                      : k
                  ),
                }
              : bu
          )
        );
      } catch (err) {
        console.error("Error toggling KPI visibility:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update KPI visibility"
        );
      }
    },
    [businessUnits]
  );

  const updateKPI = useCallback(
    async (businessUnit: string, kpiId: string, updates: Partial<KPIData>) => {
      try {
        // Find the KPI to get its business unit ID
        const businessUnitData = businessUnits.find(
          (bu) => bu.code === businessUnit
        );
        const kpi = businessUnitData?.kpis.find((k) => k.id === kpiId);
        if (!kpi) return;
        console.log("updates kpi ", updates);
        // Transform frontend data to database format
        const dbUpdates: Partial<KPIDefinition> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.target !== undefined)
          dbUpdates.target_value = updates.target;
        if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
        if (updates.trend !== undefined)
          dbUpdates.trend_direction = updates.trend;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        if (updates.isVisibleOnDashboard !== undefined)
          dbUpdates.is_visible_on_dashboard = updates.isVisibleOnDashboard;

        await DataService.updateKPIDefinition(kpiId, dbUpdates);

        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  kpis: bu.kpis.map((k) =>
                    k.id === kpiId ? { ...k, ...updates } : k
                  ),
                }
              : bu
          )
        );
      } catch (err) {
        console.error("Error updating KPI:", err);
        setError(err instanceof Error ? err.message : "Failed to update KPI");
      }
    },
    [businessUnits]
  );

  const addKPI = useCallback(
    async (businessUnit: string, kpi: Omit<KPIData, "id">) => {
      try {
        const businessUnitData = businessUnits.find(
          (bu) => bu.code === businessUnit
        );
        if (!businessUnitData) throw new Error("Business unit not found");

        // Transform frontend data to database format
        const dbKPI: Partial<KPIDefinition> = {
          name: kpi.name,
          target_value: kpi.target,
          unit: kpi.unit,
          trend_direction: kpi.trend,
          color: kpi.color,
          calculation_formula:
            "SUM(CASE WHEN deal_type = 'new' AND arr_year = 1 THEN pipeline_value ELSE 0 END)",
          dependent_metrics: ["pipeline_value", "deal_type", "arr_year"],
          is_visible_on_dashboard: kpi.isVisibleOnDashboard,
          business_unit_id: businessUnitData.id,
        };

        const newKPI = await DataService.createKPIDefinition(dbKPI);

        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  kpis: [...bu.kpis, { ...kpi, id: newKPI.id }],
                }
              : bu
          )
        );
      } catch (err) {
        console.error("Error adding KPI:", err);
        setError(err instanceof Error ? err.message : "Failed to add KPI");
      }
    },
    [businessUnits]
  );

  const deleteKPI = useCallback(
    async (businessUnit: string, kpiId: string) => {
      try {
        await DataService.updateKPIDefinition(kpiId, {
          is_visible_on_dashboard: false,
        });

        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  kpis: bu.kpis.filter((k) => k.id !== kpiId),
                }
              : bu
          )
        );
      } catch (err) {
        console.error("Error deleting KPI:", err);
        setError(err instanceof Error ? err.message : "Failed to delete KPI");
      }
    },
    [businessUnits]
  );

  const addInitiative = useCallback(
    async (businessUnit: string, initiative: Omit<InitiativeData, "id">) => {
      try {
        const businessUnitData = businessUnits.find(
          (bu) => bu.code === businessUnit
        );
        if (!businessUnitData) throw new Error("Business unit not found");

        const dbInitiative: Partial<Initiative> = {
          title: initiative.title,
          description: initiative.description,
          business_unit_id: businessUnitData.id,
          status: "active",
        };

        const newInitiative = await DataService.createInitiative(dbInitiative);

        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  initiatives: [
                    ...bu.initiatives,
                    { ...initiative, id: newInitiative.id },
                  ],
                }
              : bu
          )
        );
      } catch (err) {
        console.error("Error adding initiative:", err);
        setError(
          err instanceof Error ? err.message : "Failed to add initiative"
        );
      }
    },
    [businessUnits]
  );

  const updateInitiative = useCallback(
    async (
      businessUnit: string,
      initiativeId: string,
      updates: Partial<InitiativeData>
    ) => {
      try {
        // Transform frontend data to database format
        const dbUpdates: Partial<Initiative> = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined)
          dbUpdates.description = updates.description;

        await DataService.updateInitiative(initiativeId, dbUpdates);

        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  initiatives: bu.initiatives.map((i) =>
                    i.id === initiativeId ? { ...i, ...updates } : i
                  ),
                }
              : bu
          )
        );
      } catch (err) {
        console.error("Error updating initiative:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update initiative"
        );
      }
    },
    [businessUnits]
  );

  const deleteInitiative = useCallback(
    async (businessUnit: string, initiativeId: string) => {
      try {
        await DataService.deleteInitiative(initiativeId);

        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  initiatives: bu.initiatives.filter(
                    (i) => i.id !== initiativeId
                  ),
                }
              : bu
          )
        );
      } catch (err) {
        console.error("Error deleting initiative:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete initiative"
        );
      }
    },
    [businessUnits]
  );

  // Create businessUnitsArray for compatibility
  const businessUnitsArray = businessUnits.map((bu) => ({
    id: bu.code,
    name: bu.name,
    kpiCount: bu.kpis.length,
    actionCount: bu.initiatives.reduce(
      (total, init) => total + init.actionItems.length,
      0
    ),
    path: `/${bu.code.toLowerCase().replace(/\s+/g, "-")}`,
  }));

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    businessUnits,
    businessUnitsArray,
    loading,
    error,
    refetch: fetchAllData,
    toggleKPIVisibility,
    updateKPI,
    addKPI,
    deleteKPI,
    addInitiative,
    updateInitiative,
    deleteInitiative,
  };
};
