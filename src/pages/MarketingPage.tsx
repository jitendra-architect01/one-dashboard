import React from "react";
import BusinessUnitPage from "../components/BusinessUnitPage";
import { Megaphone } from "lucide-react";

export default function MarketingPage() {
  return (
    <BusinessUnitPage
      businessUnitCode="marketing"
      title="Marketing"
      description="Lead generation, SQL conversion, and pipeline contribution metrics"
      icon={Megaphone}
      color="bg-gradient-to-br from-green-500 to-green-600"
    />
  );
}
