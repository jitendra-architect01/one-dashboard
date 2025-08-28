import {
  businessUnitAPI,
  kpiAPI,
  initiativeAPI,
  actionItemAPI,
} from "../lib/supabase";
import type {
  BusinessUnit,
  KPIDefinition,
  Initiative,
  ActionItem,
} from "../lib/supabase";

export class DataService {
  // Business Unit Operations
  static async fetchAllBusinessUnits(): Promise<BusinessUnit[]> {
    try {
      const { data, error } = await businessUnitAPI.getAll();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching business units:", error);
      throw error;
    }
  }

  static async getBusinessUnitById(id: string): Promise<BusinessUnit | null> {
    try {
      const { data, error } = await businessUnitAPI.getById(id);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching business unit:", error);
      throw error;
    }
  }

  // KPI Operations
  static async fetchKPIDefinitions(
    businessUnitId?: string
  ): Promise<KPIDefinition[]> {
    try {
      const { data, error } = await kpiAPI.getDefinitions(businessUnitId);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching KPI definitions:", error);
      throw error;
    }
  }

  static async fetchCalculatedKPIs(
    businessUnitId?: string,
    month?: number,
    year?: number
  ) {
    try {
      const { data, error } = await kpiAPI.getCalculatedKPIs(
        businessUnitId,
        month,
        year
      );
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching calculated KPIs:", error);
      throw error;
    }
  }

  static async toggleKPIVisibility(
    kpiId: string,
    isVisible: boolean
  ): Promise<void> {
    try {
      const { error } = await kpiAPI.toggleVisibility(kpiId, isVisible);
      if (error) throw error;
    } catch (error) {
      console.error("Error toggling KPI visibility:", error);
      throw error;
    }
  }

  static async createKPIDefinition(
    kpiData: Partial<KPIDefinition>
  ): Promise<KPIDefinition> {
    try {
      const { data, error } = await kpiAPI.createDefinition(kpiData);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating KPI definition:", error);
      throw error;
    }
  }

  static async updateKPIDefinition(
    kpiId: string,
    updates: Partial<KPIDefinition>
  ): Promise<KPIDefinition> {
    try {
      const { data, error } = await kpiAPI.updateDefinition(kpiId, updates);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating KPI definition:", error);
      throw error;
    }
  }

  static async deleteKPIDefinition(kpiId: string): Promise<void> {
    try {
      const { error } = await kpiAPI.deleteDefinition(kpiId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting KPI definition:", error);
      throw error;
    }
  }

  // Initiative Operations
  static async fetchInitiatives(
    businessUnitId?: string
  ): Promise<Initiative[]> {
    try {
      const { data, error } = businessUnitId
        ? await initiativeAPI.getByBusinessUnit(businessUnitId)
        : await initiativeAPI.getAll();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching initiatives:", error);
      throw error;
    }
  }

  static async createInitiative(
    initiativeData: Partial<Initiative>
  ): Promise<Initiative> {
    try {
      const { data, error } = await initiativeAPI.create(initiativeData);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating initiative:", error);
      throw error;
    }
  }

  static async updateInitiative(
    initiativeId: string,
    updates: Partial<Initiative>
  ): Promise<Initiative> {
    try {
      const { data, error } = await initiativeAPI.update(initiativeId, updates);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating initiative:", error);
      throw error;
    }
  }

  static async deleteInitiative(initiativeId: string): Promise<void> {
    try {
      const { error } = await initiativeAPI.delete(initiativeId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting initiative:", error);
      throw error;
    }
  }

  // Action Item Operations
  static async fetchActionItems(initiativeId?: string): Promise<ActionItem[]> {
    try {
      const { data, error } = initiativeId
        ? await actionItemAPI.getByInitiative(initiativeId)
        : await actionItemAPI.getAll();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching action items:", error);
      throw error;
    }
  }

  static async createActionItem(
    actionItemData: Partial<ActionItem>
  ): Promise<ActionItem> {
    try {
      const { data, error } = await actionItemAPI.create(actionItemData);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating action item:", error);
      throw error;
    }
  }

  static async updateActionItem(
    actionItemId: string,
    updates: Partial<ActionItem>
  ): Promise<ActionItem> {
    try {
      const { data, error } = await actionItemAPI.update(actionItemId, updates);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating action item:", error);
      throw error;
    }
  }

  static async deleteActionItem(actionItemId: string): Promise<void> {
    try {
      const { error } = await actionItemAPI.delete(actionItemId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting action item:", error);
      throw error;
    }
  }

  // Data Transformation Utilities
  static generateBusinessUnitsArray(
    businessUnits: Array<{
      id: string;
      name: string;
      kpis: unknown[];
      initiatives: Array<{ actionItems: unknown[] }>;
    }>
  ) {
    return businessUnits.map((bu) => ({
      id: bu.id,
      name: bu.name,
      kpiCount: bu.kpis.length,
      actionCount: bu.initiatives.reduce(
        (total, initiative) => total + (initiative.actionItems?.length || 0),
        0
      ),
      path: `/${bu.id}`,
    }));
  }
}
