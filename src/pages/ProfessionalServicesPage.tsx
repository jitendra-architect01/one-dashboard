import React from "react";
import BusinessUnitPage from "../components/BusinessUnitPage";
import { Briefcase } from "lucide-react";

export default function ProfessionalServicesPage() {
  return (
    <BusinessUnitPage
      businessUnitCode="professional_services"
      title="Professional Services"
      description="Revenue delivery, margin optimization, and client satisfaction tracking"
      icon={Briefcase}
      color="bg-gradient-to-br from-orange-500 to-orange-600"
    />
  );
}
