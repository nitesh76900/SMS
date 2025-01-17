import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Clock, Users, BookOpen, CheckSquare } from "lucide-react";
import TeacherDashboardService from "../services/TeacherDashboardService";
import Loader from "../components/Loader/Loader";

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: { value: 0, change: 0 },
    averageAttendance: { value: 0, change: 0 },
    classesToday: { value: 0, change: 0 },
    teachingHours: { value: "0h", change: 0 },
    attendanceTrends: [],
    classPerformance: [],
    upcomingSchedule: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await TeacherDashboardService.getDashboardStats();
      console.log(" Teacher Dashboard data", data);
      setDashboardData({
        ...data,
        attendanceTrends: TeacherDashboardService.processAttendanceTrends(
          data.attendanceTrends
        ),
        classPerformance: TeacherDashboardService.processClassPerformance(
          data.classPerformance
        ),
        upcomingSchedule: TeacherDashboardService.formatSchedule(
          data.upcomingSchedule
        ),
      });
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error(err);
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
          <p
            className={`text-sm mt-2 ${
              parseFloat(change) >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {parseFloat(change) >= 0 ? "↑" : "↓"} {Math.abs(change)}% from last
            month
          </p>
        </div>
        <Icon size={24} className="text-blue-500" />
      </div>
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-red-500">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, Professor</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Students"
          value={dashboardData.totalStudents.value}
          change={dashboardData.totalStudents.change}
        />
        <StatCard
          icon={CheckSquare}
          title="Average Attendance"
          value={`${dashboardData.averageAttendance.value}%`}
          change={dashboardData.averageAttendance.change}
        />
        <StatCard
          icon={BookOpen}
          title="Classes Today"
          value={dashboardData.classesToday.value}
          change={dashboardData.classesToday.change}
        />
        <StatCard
          icon={Clock}
          title="Teaching Hours"
          value={dashboardData.teachingHours.value}
          change={dashboardData.teachingHours.change}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Attendance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.attendanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Present %"
              />
              <Line
                type="monotone"
                dataKey="absent"
                stroke="#EF4444"
                strokeWidth={2}
                name="Absent %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Class Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Class Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.classPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#3B82F6" name="Average Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Upcoming Schedule</h3>
          <div className="space-y-4">
            {dashboardData.upcomingSchedule.map((schedule, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {schedule.subject}
                  </p>
                  <p className="text-sm text-gray-500">{schedule.class}</p>
                </div>
                <span className="text-blue-500">{schedule.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
