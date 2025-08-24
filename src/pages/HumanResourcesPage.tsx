import React from "react";
import BusinessUnitPage from "../components/BusinessUnitPage";
import { UserCheck } from "lucide-react";

export default function HumanResourcesPage() {
  return (
    <BusinessUnitPage
      businessUnitCode="human_resources"
      title="Human Resources"
      description="Talent acquisition, retention metrics, and organizational development"
      icon={UserCheck}
      color="bg-gradient-to-br from-pink-500 to-pink-600"
    />
  );
}
