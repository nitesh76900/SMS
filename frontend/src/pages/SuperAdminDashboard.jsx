import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  GraduationCap,
  UserCheck,
  IndianRupee,
  Clock,
  BellRing,
  UserPlus,
  HeartPulse,
} from "lucide-react";
import AdminDashboardService from "../services/adminDashboardService";
import { useToast } from "../context/ToastContext";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const StatsCard = ({ title, value, icon: Icon, subValue, subLabel, trend }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-blue-500" />
      </div>
      {trend && (
        <span
          className={`text-sm font-medium ${
            trend >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
    <div className="text-2xl font-bold text-gray-800 mb-2">{value}</div>
    {subValue && (
      <div className="text-sm text-gray-500 flex items-center gap-1">
        <span className="font-medium">{subLabel}:</span> {subValue}
      </div>
    )}
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const SuperAdminDashboard = () => {
  const showToast = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const response = await AdminDashboardService.getDashboardStats();
      console.log("response", response);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      showToast("Failed to fetch dashboard statistics", "error");
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      await AdminDashboardService.updateDashboardStats();
      const response = await AdminDashboardService.getDashboardStats();
      setDashboardData(response.data);
      showToast("Dashboard data refreshed successfully", "success");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      showToast("Failed to refresh dashboard data", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
      </div>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const revenueData = dashboardData.financialStats.monthlyRevenue.map(
    (item) => ({
      month: new Date(item.month).toLocaleDateString("en-US", {
        month: "short",
      }),
      amount: item.amount,
    })
  );

  const connectionData =
    dashboardData.connectionStats.professionDistribution.map((item) => ({
      name: item.profession.charAt(0).toUpperCase() + item.profession.slice(1),
      value: item.count,
    }));

  const attendanceData = [
    {
      name: "Students",
      present: dashboardData.attendanceStats.students.monthly.present,
      absent: dashboardData.attendanceStats.students.monthly.absent,
    },
    {
      name: "Teachers",
      present: dashboardData.attendanceStats.teachers.monthly.present,
      absent: dashboardData.attendanceStats.teachers.monthly.absent,
    },
  ];

  const salaryData = dashboardData.financialStats.salaryDistribution.map(
    (dept) => ({
      name: dept?.department?.name || null,
      salary: dept?.totalSalary || null,
    })
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Super Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive overview of your institution
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
              <span className="text-sm text-gray-500">Last updated:</span>
              <span className="ml-2 text-sm font-medium">
                {new Date(dashboardData.lastUpdated).toLocaleString()}
              </span>
            </div>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={dashboardData.studentStats.totalStudents}
            icon={Users}
            subValue={dashboardData.studentStats.newAdmissions.monthly}
            subLabel="New Admissions"
            trend={10}
          />

          <StatsCard
            title="Total Staff"
            value={dashboardData.staffStats.totalStaff}
            icon={GraduationCap}
            subValue={`${dashboardData.staffStats.teacherStudentRatio.toFixed(
              2
            )}`}
            subLabel="Teacher-Student Ratio"
          />

          <StatsCard
            title="Revenue Collection"
            value={formatCurrency(dashboardData.financialStats.totalRevenue)}
            icon={IndianRupee}
            subValue={`${dashboardData.financialStats.feeCollectionRate}%`}
            subLabel="Collection Rate"
            trend={5}
          />

          <StatsCard
            title="Parent Connections"
            value={
              dashboardData.communicationStats.parentEngagement.totalConnections
            }
            icon={UserCheck}
            subValue={
              dashboardData.communicationStats.parentEngagement.activeParents
            }
            subLabel="Active Parents"
          />

          <StatsCard
            title="Live Sessions"
            value={dashboardData.liveSessionStats.today.scheduled}
            icon={Clock}
            subValue={`${dashboardData.liveSessionStats.averageSessionDuration} mins`}
            subLabel="Avg Duration"
          />

          <StatsCard
            title="Active Notices"
            value={dashboardData.communicationStats.activeNotices}
            icon={BellRing}
            subValue={dashboardData.communicationStats.liveSessions.scheduled}
            subLabel="Scheduled Events"
          />

          <StatsCard
            title="New Connections"
            value={dashboardData.connectionStats.newConnectionsThisMonth}
            icon={UserPlus}
            subValue={dashboardData.connectionStats.total}
            subLabel="Total Users"
          />

          <StatsCard
            title="Monthly Attendance"
            value={`${(
              (dashboardData.attendanceStats.students.monthly.present /
                (dashboardData.attendanceStats.students.monthly.present +
                  dashboardData.attendanceStats.students.monthly.absent)) *
              100
            ).toFixed(1)}%`}
            icon={HeartPulse}
            subValue="Students Present"
            subLabel="Average"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Revenue Trend"
            subtitle="Monthly revenue collection pattern"
          >
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0088FE"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="User Distribution"
            subtitle="Platform user type breakdown"
          >
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={connectionData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {connectionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Department Salary Distribution"
            subtitle="Total salary by department"
          >
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="salary" fill="#0088FE">
                    {salaryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Monthly Attendance"
            subtitle="Staff and student attendance patterns"
          >
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" name="Present" fill="#00C49F" />
                  <Bar dataKey="absent" name="Absent" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
