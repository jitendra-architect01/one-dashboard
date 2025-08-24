import React from "react";
import BusinessUnitPage from "../components/BusinessUnitPage";
import { TrendingUp } from "lucide-react";

export default function SalesPage() {
  return (
    <BusinessUnitPage
      businessUnitCode="sales"
      title="Sales"
      description="ARR attainment, pipeline management, and win rate tracking"
      icon={TrendingUp}
      color="bg-gradient-to-br from-blue-500 to-blue-600"
    />
  );
}
