import React from "react";
import BusinessUnitPage from "../components/BusinessUnitPage";
import { FileText } from "lucide-react";

export default function GeneralAdministrativePage() {
  return (
    <BusinessUnitPage
      businessUnitCode="general_administrative"
      title="General & Administrative"
      description="Administrative functions, compliance, and operational support"
      icon={FileText}
      color="bg-gradient-to-br from-gray-500 to-gray-600"
    />
  );
}