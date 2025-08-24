import React from "react";
import BusinessUnitPage from "../components/BusinessUnitPage";
import { HeadphonesIcon } from "lucide-react";

export default function CustomerSuccessPage() {
  return (
    <BusinessUnitPage
      businessUnitCode="customer_success"
      title="Customer Success"
      description="Churn management, retention rates, and customer expansion tracking"
      icon={HeadphonesIcon}
      color="bg-gradient-to-br from-teal-500 to-teal-600"
    />
  );
}
