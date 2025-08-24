import React from "react";
import BusinessUnitPage from "../components/BusinessUnitPage";
import { Code } from "lucide-react";

export default function ProductEngineeringPage() {
  return (
    <BusinessUnitPage
      businessUnitCode="product_engineering"
      title="Product & Engineering"
      description="Feature delivery, release performance, and product adoption metrics"
      icon={Code}
      color="bg-gradient-to-br from-indigo-500 to-indigo-600"
    />
  );
}
