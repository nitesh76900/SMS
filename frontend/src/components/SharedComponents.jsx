import React from 'react';
import { Check, X } from "lucide-react";

// StatsCard Component
export const StatsCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="text-3xl">{icon}</div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  </div>
);

// CustomCard Component
export const CustomCard = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all ${
      onClick ? "hover:border-blue-200 cursor-pointer" : ""
    } ${className}`}
  >
    {children}
  </div>
);

// CustomButton Component
export const CustomButton = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// SearchBar Component
export const SearchBar = ({ onSearch }) => (
  <div className="relative mb-6">
    <input
      type="text"
      placeholder="Search staff members..."
      onChange={(e) => onSearch(e.target.value)}
      className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      🔍
    </div>
  </div>
);

// CustomTable Component
export const CustomTable = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">{children}</tbody>
    </table>
  </div>
);

// DepartmentCard Component
export const DepartmentCard = ({ name, staffCount, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-500">{staffCount} staff members</p>
      </div>
      <div className="text-gray-400">→</div>
    </div>
  </div>
);
export const ProgressSteps = ({ steps, currentStep }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            <div className="text-xs mt-2 font-medium text-gray-600">{step}</div>
          </div>
        ))}
        <div className="absolute top-4 left-0 h-0.5 bg-gray-200 w-full -z-10" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-300 -z-10"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
export const CustomInput = ({
    label,
    type = "text",
    name,
    placeholder,
    value,
    onChange,
    error,
  }) => (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg border ${
          error
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        } focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );