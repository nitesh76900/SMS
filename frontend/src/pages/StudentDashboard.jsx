import React from "react";
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Clock, BookOpen, Users } from "lucide-react";
import StudentDashboardService from "../services/StudentDashboardService";
import Loader from "../components/Loader/Loader";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = React.useState({
    stats: {
      attendanceRate: { current: 0, percentageChange: 0 },
      averageGrade: { current: 0, percentageChange: 0 },
      classRank: { current: 0, percentageChange: 0 },
      classSize: { current: 0, percentageChange: 0 },
    },
    monthlyAttendance: [],
    academicPerformance: [],
    submissionStatus: { submitted: 0, pending: 0 },
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await StudentDashboardService.getDashboardData();
      console.log("Student Dashboard data", data);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {change !== 0 && (
            <span
              className={`text-sm ${
                change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
            </span>
          )}
        </div>
        <Icon className="text-blue-500" size={24} />
      </div>
    </div>
  );

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Transform monthly attendance data to handle string values
  const transformedAttendanceData = dashboardData.monthlyAttendance.map(
    (item) => ({
      ...item,
      present: parseFloat(item.present),
      absent: parseFloat(item.absent),
    })
  );

  // Handle empty academic performance data
  const defaultAcademicData = [{ subject: "No Data", marks: 0, average: 0 }];

  // Transform submission status data for pie chart
  const submissionChartData = [
    { name: "Submitted", value: dashboardData.submissionStatus.submitted },
    { name: "Pending", value: dashboardData.submissionStatus.pending },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Student Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, Student</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Attendance Rate"
            value={`${dashboardData.stats.attendanceRate.current}%`}
            change={dashboardData.stats.attendanceRate.percentageChange}
          />
          <StatCard
            icon={BookOpen}
            title="Average Grade"
            value={`${dashboardData.stats.averageGrade.current}/100`}
            change={dashboardData.stats.averageGrade.percentageChange}
          />
          <StatCard
            icon={Users}
            title="Class Rank"
            value={`#${dashboardData.stats.classRank.current}`}
            change={dashboardData.stats.classRank.percentageChange}
          />
          <StatCard
            icon={Users}
            title="Class Size"
            value={dashboardData.stats.classSize.current}
            change={dashboardData.stats.classSize.percentageChange}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Monthly Attendance</h3>
            {transformedAttendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transformedAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#3b82f6"
                    name="Present %"
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    stroke="#ef4444"
                    name="Absent %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No attendance data available
              </div>
            )}
          </div>

          {/* Academic Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Academic Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  dashboardData.academicPerformance.length > 0
                    ? dashboardData.academicPerformance
                    : defaultAcademicData
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="marks" fill="#3b82f6" name="Your Marks" />
                <Bar dataKey="average" fill="#93c5fd" name="Class Average" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Submission Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Submission Status</h3>
            {submissionChartData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={submissionChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#3b82f6"
                    label
                  ></Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No submission data available
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No recent activity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
