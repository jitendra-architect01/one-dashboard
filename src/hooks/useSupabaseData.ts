import { useState, useEffect, useCallback } from "react";
import { DataService } from "../services/dataService";
import { getMockKPIs, getMockInitiatives } from "../services/mockDataService";
import type { KPIDefinition, Initiative } from "../lib/supabase";
import type { KPICategory } from "../types/data";

// Frontend-friendly data interfaces
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
  monthlyData?: number[];
  category?: KPICategory;
  quarterlyTargets?: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
    Year: number;
  };
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
  updateActionItem: (
    actionItemId: string,
    updates: Partial<ActionItemData>
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

      console.log("Raw data received:", {
        businessUnits: businessUnitsData,
        kpis: kpiDefinitions,
        initiatives,
        actionItems,
      });

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
              category: (kpi.category as KPICategory) || "Monthly", // Default to Monthly for existing KPIs
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
                  team: action.tags?.[0] || action.department || "General",
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
    async (
      businessUnit: string,
      kpiId: string,
      updates: Partial<KPIData>
    ) => {
      try {
        console.log('updateKPI called with:', { businessUnit, kpiId, updates });
        
        const businessUnitData = businessUnits.find(
          (bu) => bu.code === businessUnit
        );
        if (!businessUnitData) {
          throw new Error("Business unit not found");
        }

        const kpi = businessUnitData.kpis.find((k) => k.id === kpiId);
        if (!kpi) {
          throw new Error("KPI not found");
        }

        const dbUpdates: any = {};
        
        // Only update fields that exist in the database schema
        if (updates.target !== undefined) dbUpdates.target_value = updates.target;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.isVisibleOnDashboard !== undefined)
          dbUpdates.is_visible_on_dashboard = updates.isVisibleOnDashboard;
        if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
        if (updates.trend !== undefined) dbUpdates.trend_direction = updates.trend;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        
        // Note: monthly_data field doesn't exist in KPIDefinition table
        // We'll need to handle this separately or add the field to the database
        if (updates.monthlyData !== undefined) {
          console.warn('monthlyData field not supported in current database schema');
          // TODO: Add monthly_data field to KPIDefinition table or create separate table
        }
        
        // Handle quarterly targets
        if (updates.quarterlyTargets !== undefined) {
          console.warn('quarterlyTargets field not supported in current database schema');
          // TODO: Add quarterly_targets field to KPIDefinition table or create separate table
        }

        console.log('Database updates to be applied:', dbUpdates);
        
        if (Object.keys(dbUpdates).length === 0) {
          console.log('No valid fields to update, skipping database call');
          return;
        }

        await DataService.updateKPIDefinition(kpiId, dbUpdates);
        console.log('Database update successful');

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
        
        console.log('Local state update successful');
      } catch (err) {
        console.error("Error updating KPI:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update KPI"
        );
        throw err; // Re-throw to let caller handle the error
      }
    },
    [businessUnits]
  );

  const updateActionItem = useCallback(
    async (actionItemId: string, updates: Partial<ActionItemData>) => {
      try {
        const dbUpdates: any = {};
        if (updates.action !== undefined) dbUpdates.title = updates.action;
        if (updates.owner !== undefined) {
          // Store the full name in assigned_to field
          dbUpdates.assigned_to = updates.owner;
        }
        if (updates.status !== undefined) {
          const statusMap: Record<string, string> = {
            'Not Started': 'not_started',
            'In Progress': 'in_progress',
            'Completed': 'completed',
            'Overdue': 'blocked' // Mapped 'Overdue' to 'blocked' in DB
          };
          dbUpdates.status = statusMap[updates.status] || updates.status;
        }
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.priority !== undefined) {
          const priorityMap: Record<string, string> = {
            'Low': 'low',
            'Medium': 'medium',
            'High': 'high'
          };
          dbUpdates.priority = priorityMap[updates.priority] || updates.priority;
        }
        if (updates.team !== undefined) {
          // Store team in tags array for now (since there's no dedicated team field)
          dbUpdates.tags = [updates.team];
        }

        await DataService.updateActionItem(actionItemId, dbUpdates);

        setBusinessUnits((prev) =>
          prev.map((bu) => ({
            ...bu,
            initiatives: bu.initiatives.map((init) => ({
              ...init,
              actionItems: init.actionItems.map((action) =>
                action.id === actionItemId ? { ...action, ...updates } : action
              ),
            })),
          }))
        );
      } catch (err) {
        console.error("Error updating action item:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update action item"
        );
        throw err;
      }
    },
    []
  );

  const addKPI = useCallback(
    async (businessUnit: string, kpi: Omit<KPIData, "id">) => {
      try {
        const businessUnitData = businessUnits.find((bu) => bu.code === businessUnit);
        if (!businessUnitData) {
          throw new Error("Business unit not found");
        }

        const kpiData: Partial<KPIDefinition> = {
          name: kpi.name,
          description: kpi.name,
          calculation_formula: "manual",
          dependent_metrics: ["pipeline_value", "deal_type", "arr_year"],
          is_visible_on_dashboard: true, // Always make new KPIs visible
          business_unit_id: businessUnitData.id,
          target_value: kpi.target || 0,
          unit: kpi.unit || "",
          trend_direction: kpi.trend || "neutral",
          color: kpi.color || "bg-gray-500",
        };

        const newKPI = await DataService.createKPIDefinition(kpiData);

        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  kpis: [
                    ...bu.kpis,
                    {
                      ...kpi,
                      id: newKPI.id,
                      isVisibleOnDashboard: true, // Ensure it's visible in local state
                      quarterlyTargets: {
                        Q1: 0,
                        Q2: 0,
                        Q3: 0,
                        Q4: 0,
                        Year: kpi.target || 0
                      }
                    },
                  ],
                }
              : bu
          )
        );
      } catch (err) {
        console.error("Error adding KPI:", err);
        setError(
          err instanceof Error ? err.message : "Failed to add KPI"
        );
      }
    },
    [businessUnits]
  );

  const deleteKPI = useCallback(
    async (businessUnit: string, kpiId: string) => {
      try {
        // Actually delete the KPI from the database
        await DataService.deleteKPIDefinition(kpiId);

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
    []
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

        // Create action items for this initiative
        const createdActionItems: ActionItemData[] = [];
        if (initiative.actionItems && initiative.actionItems.length > 0) {
          for (const actionItem of initiative.actionItems) {
            try {
              const dbActionItem = {
                initiative_id: newInitiative.id,
                business_unit_id: businessUnitData.id,
                title: actionItem.action,
                description: actionItem.action,
                action_type: "task",
                status: actionItem.status === "Not Started" ? "not_started" :
                        actionItem.status === "In Progress" ? "in_progress" :
                        actionItem.status === "Completed" ? "completed" : "not_started",
                priority: actionItem.priority === "High" ? "high" :
                          actionItem.priority === "Medium" ? "medium" : "low",
                due_date: actionItem.dueDate !== "No due date" ? actionItem.dueDate : null,
                assigned_to: actionItem.owner !== "Unassigned" ? actionItem.owner : null,
                tags: actionItem.team !== "General" ? [actionItem.team] : [],
                dependencies: [],
                attachments: [],
                comments: []
              };
              
              const createdActionItem = await DataService.createActionItem(dbActionItem);
              createdActionItems.push({
                id: createdActionItem.id,
                action: actionItem.action,
                owner: actionItem.owner,
                status: actionItem.status,
                dueDate: actionItem.dueDate,
                priority: actionItem.priority,
                team: actionItem.team
              });
            } catch (actionError) {
              console.error("Error creating action item:", actionError);
            }
          }
        }
        // Update local state
        setBusinessUnits((prev) =>
          prev.map((bu) =>
            bu.code === businessUnit
              ? {
                  ...bu,
                  initiatives: [
                    ...bu.initiatives,
                    { 
                      ...initiative, 
                      id: newInitiative.id,
                      actionItems: createdActionItems
                    },
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

        // Handle action items updates
        if (updates.actionItems) {
          const businessUnitData = businessUnits.find(bu => bu.code === businessUnit);
          if (businessUnitData) {
            // Get existing action items for this initiative
            const existingActionItems = await DataService.fetchActionItems(initiativeId);
            
            // Process each action item in the update
            for (const actionItem of updates.actionItems) {
              if (actionItem.id.startsWith('temp-')) {
                // This is a new action item, create it
                const dbActionItem = {
                  initiative_id: initiativeId,
                  business_unit_id: businessUnitData.id,
                  title: actionItem.action,
                  description: actionItem.action,
                  action_type: "task",
                  status: 
                    actionItem.status === "Not Started" ? "not_started" :
                    actionItem.status === "In Progress" ? "in_progress" :
                    actionItem.status === "Completed" ? "completed" : 
                    actionItem.status === "Blocked" ? "blocked" : "not_started",
                  priority: 
                    actionItem.priority === "Critical" ? "critical" :
                    actionItem.priority === "High" ? "high" :
                    actionItem.priority === "Medium" ? "medium" : "low",
                  due_date: actionItem.dueDate !== "No due date" ? actionItem.dueDate : null,
                  assigned_to: actionItem.owner && actionItem.owner !== "Unassigned" ? actionItem.owner : null,
                  tags: actionItem.team && actionItem.team !== "General" ? [actionItem.team] : [],
                  dependencies: [],
                  attachments: [],
                  comments: []
                };
                
                try {
                  await DataService.createActionItem(dbActionItem);
                } catch (actionError) {
                  console.error("Error creating new action item:", actionError);
                }
              } else {
                // This is an existing action item, update it
                const dbUpdatesForActionItem = {
                  title: actionItem.action,
                  status: 
                    actionItem.status === "Not Started" ? "not_started" :
                    actionItem.status === "In Progress" ? "in_progress" :
                    actionItem.status === "Completed" ? "completed" : 
                    actionItem.status === "Blocked" ? "blocked" : "not_started",
                  priority: 
                    actionItem.priority === "Critical" ? "critical" :
                    actionItem.priority === "High" ? "high" :
                    actionItem.priority === "Medium" ? "medium" : "low",
                  due_date: actionItem.dueDate !== "No due date" ? actionItem.dueDate : null,
                  assigned_to: actionItem.owner && actionItem.owner !== "Unassigned" ? actionItem.owner : null,
                  tags: actionItem.team && actionItem.team !== "General" ? [actionItem.team] : [],
                };
                
                try {
                  await DataService.updateActionItem(actionItem.id, dbUpdatesForActionItem);
                } catch (actionError) {
                  console.error("Error updating action item:", actionError);
                }
              }
            }
          }
        }
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
    updateActionItem
  };
};