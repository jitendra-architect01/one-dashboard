import React from "react";
import DatabasePopulator from "../../components/admin/DatabasePopulator";

const DatabaseAdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <DatabasePopulator />
      </div>
    </div>
  );
};

export default DatabaseAdminPage;
