import React, { useState } from "react";
import DriversTab from "./TransportManagement/DriversTab";
import VehiclesTab from "./TransportManagement/VehiclesTab";
import BusRoute from "./TransportManagement/BusRoute";
import RouteForm from "./TransportManagement/RouteForm";

const TransportManagement = () => {
  const [activeTab, setActiveTab] = useState("drivers");

  const tabs = [
    {
      id: "drivers",
      label: "Drivers",
      component: <DriversTab />,
    },
    {
      id: "vehicles",
      label: "Vehicles",
      component: <VehiclesTab />,
    },
    {
      id: "routes",
      label: "Routes",
      component: <BusRoute />,
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b bg-gray-50/50 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Transport Management
          </h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                    transition-colors duration-200
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`${activeTab === tab.id ? "block" : "hidden"}`}
              >
                {tab.component}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportManagement;
