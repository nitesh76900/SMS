import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard, CustomCard } from "../components/SharedComponents";
import staffServices from "../services/staffServices";
import { useToast } from "../context/ToastContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [stats, setStats] = useState({
    totalStaff: 0,
    departments: 0,
    newStaff: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await staffServices.getAllStaff();
        const departments = response.data;
        console.log(departments)

        // Calculate total staff across all departments
        const totalStaff = departments.reduce(
          (total, dept) => total + dept.staffMembers.length,
          0
        );

        // Calculate new staff (joined this month)
        const currentDate = new Date();
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );

        const newStaffCount = departments.reduce((total, dept) => {
          return (
            total +
            dept.staffMembers.filter(
              (staff) => new Date(staff.joinDate) >= firstDayOfMonth
            ).length
          );
        }, 0);

        setStats({
          totalStaff,
          departments: departments.length,
          newStaff: newStaffCount,
        });
        showToast("Dashboard data loaded successfully", "success");
      } catch (err) {
        showToast("Failed to fetch dashboard data", "error");
        setError("Failed to fetch dashboard data");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Staff Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          icon="👥"
          label="Total Staff"
          value={stats.totalStaff.toString()}
        />
        <StatsCard
          icon="🏢"
          label="Total Departments"
          value={stats.departments.toString()}
        />
        <StatsCard
          icon="📈"
          label="New Staff This Month"
          value={stats.newStaff.toString()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomCard
          onClick={() => navigate("/staff-departments")}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-medium mb-2">View Departments</h3>
          <p className="text-sm text-gray-600">Manage staff by department</p>
        </CustomCard>

        <CustomCard
          onClick={() => navigate("/add-staff")}
          className="cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <h3 className="text-lg font-medium mb-2">Add New Staff</h3>
          <p className="text-sm text-gray-600">Create new staff profile</p>
        </CustomCard>
      </div>
    </div>
  );
};

export default DashboardPage;
