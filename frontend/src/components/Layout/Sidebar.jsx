import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaChalkboardTeacher,
  FaNetworkWired,
  FaSignOutAlt,
  FaUserGraduate,
  FaBook,
  FaClipboardCheck,
  FaBars,
  FaBell,
  FaGraduationCap,
  FaVideo,
  FaChevronDown,
  FaBus,
  FaCalendarAlt,
} from "react-icons/fa";
import { RiParentFill } from "react-icons/ri";
import { MdDashboard, MdPayment } from "react-icons/md";
import { TbCalendarTime } from "react-icons/tb";
import { GiTeacher } from "react-icons/gi";
import { SiGoogleclassroom } from "react-icons/si";
import AuthService from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";

// Menu configuration based on roles
const menuConfig = {
  admin: {
    main: ["dashboard", "students", "teachers", "staff", "class"],
    academic: ["time-table", "student-marks", "result"],
    attendance: ["attendance", "staff-attendance"],
    communication: ["parents", "notices", "connections"],
    finance: ["fee-reminder"],
    transport: ["transport", "VehicleTrackingPage"],
  },
  superAdmin: {
    main: ["dashboard", "students", "teachers", "staff", "class"],
    academic: ["time-table", "student-marks", "result"],
    attendance: ["attendance", "staff-attendance"],
    communication: ["notices", "connections"],
    finance: ["fee-reminder"],
    transport: ["transport", "VehicleTrackingPage"],
  },
  teacher: {
    main: ["dashboard", "students", "class"],
    academic: ["time-table", "assesments", "student-marks", "result"],
    attendance: ["attendance"],
    communication: ["parents", "notices", "live-sessions", "connections"],
    transport: ["VehicleTrackingPage"],
  },
  student: {
    main: ["dashboard"],
    academic: ["time-table", "assesments", "result"],
    communication: ["notices", "live-sessions"],
    transport: ["VehicleTrackingPage"],
  },
};

// Menu items configuration with their respective icons and labels
const menuItems = {
  dashboard: { icon: MdDashboard, label: "Dashboard", path: "/dashboard" },
  students: { icon: FaUserGraduate, label: "Students", path: "/students" },
  teachers: { icon: GiTeacher, label: "Teachers", path: "/teachers" },
  staff: { icon: FaChalkboardTeacher, label: "Staff", path: "/staff" },
  class: { icon: SiGoogleclassroom, label: "Class", path: "/class" },
  "time-table": {
    icon: TbCalendarTime,
    label: "Time Table",
    path: "/time-table",
  },
  assesments: {
    icon: FaClipboardCheck,
    label: "Assessments",
    path: "/assesments",
  },
  "student-marks": {
    icon: FaBook,
    label: "Student Marks",
    path: "/student-marks",
  },
  result: { icon: FaGraduationCap, label: "Results", path: "/result" },
  attendance: {
    icon: FaCalendarAlt,
    label: "Student Attendance",
    path: "/attendance",
  },
  "staff-attendance": {
    icon: FaCalendarAlt,
    label: "Staff Attendance",
    path: "/staff-attendance",
  },
  parents: { icon: RiParentFill, label: "Parents", path: "/parents" },
  notices: { icon: FaBell, label: "Notices", path: "/notices" },
  "live-sessions": {
    icon: FaVideo,
    label: "Live Sessions",
    path: "/live-sessions",
  },
  connections: {
    icon: FaNetworkWired,
    label: "Connections",
    path: "/connections",
  },
  "fee-reminder": {
    icon: MdPayment,
    label: "Fee Reminder",
    path: "/fee-reminder",
  },
  transport: {
    icon: FaBus,
    label: "School Transportation",
    path: "/transport",
  },
  VehicleTrackingPage: {
    icon: FaBus,
    label: "School VehicleTrackingPage",
    path: "/vehicle-histories",
  },
};

const Sidebar = () => {
  const user = useSelector(selectUser);
  const [isOpen, setIsOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState(["Main"]); // Default to the first group
  const location = useLocation();
  const showToast = useToast();
  const navigate = useNavigate();

  const isRouteActive = (path) => location.pathname === path;

  const isGroupActive = (routes) => {
    return routes.some((route) => isRouteActive(route));
  };

  const handleLogout = async () => {
    const response = await AuthService.logout();
    if (response.message) {
      showToast("Logout Successfully", "success");
      navigate("/");
    }
    return response;
  };

  const MenuGroup = ({ title, items }) => {
    const isExpanded = expandedGroups.includes(title);
    const groupRoutes = items.map((item) => menuItems[item].path);
    const isActive = isGroupActive(groupRoutes);

    const handleToggle = () => {
      setExpandedGroups((prevExpanded) =>
        isExpanded
          ? prevExpanded.filter((group) => group !== title)
          : [...prevExpanded, title]
      );
    };

    // Don't render the group if there are no items
    if (items.length === 0) return null;

    return (
      <div className="mb-2">
        <button
          onClick={handleToggle}
          className={`w-full px-4 py-2.5 text-left flex items-center justify-between
            hover:bg-gray-800/40 hover:text-gray-200 transition-all duration-300 rounded-xl mx-2
            group relative overflow-hidden
            ${isActive ? "bg-gray-800/20 text-blue-400" : "text-gray-400"}`}
        >
          <span
            className={`text-xs font-semibold uppercase tracking-wider relative z-10
            transition-colors duration-300
            ${isActive ? "text-blue-400" : ""}`}
          >
            {title}
          </span>
          <div
            className={`absolute inset-0 bg-gradient-to-r transition-all duration-300
            ${
              isActive
                ? "from-blue-600/10 to-blue-600/5"
                : "from-blue-600/0 to-blue-600/0"
            }
            group-hover:from-blue-600/5 group-hover:to-blue-600/10`}
          />
          <FaChevronDown
            className={`w-3 h-3 transition-all duration-300 ease-in-out relative z-10
              transform-gpu
              ${
                isExpanded
                  ? "rotate-180 text-blue-400"
                  : "rotate-0 text-gray-500"
              }
              ${isActive ? "text-blue-400" : ""}`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out transform-gpu
            ${
              isExpanded
                ? "max-h-[400px] opacity-100 translate-y-0 scale-100"
                : "max-h-0 opacity-0 -translate-y-2 scale-95"
            }`}
        >
          <ul
            className={`mt-1 space-y-1 px-2 transition-all duration-300 transform-gpu
            ${
              isExpanded
                ? "translate-y-0 opacity-100"
                : "-translate-y-4 opacity-0"
            }`}
          >
            {items.map((item) => (
              <MenuItem
                key={item}
                to={menuItems[item].path}
                icon={menuItems[item].icon}
                label={menuItems[item].label}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const MenuItem = ({ to, icon: Icon, label }) => (
    <li className="transform-gpu transition-transform duration-200 ease-out">
      <Link
        to={to}
        className={`flex items-center px-4 py-2.5 text-sm transition-all duration-200 
          relative overflow-hidden group
          ${
            isRouteActive(to)
              ? "text-white bg-gradient-to-r from-blue-600 to-blue-500 font-medium shadow-lg shadow-blue-500/20"
              : "text-gray-300 hover:text-white hover:bg-gray-800/30"
          } rounded-xl`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 
          group-hover:from-white/5 group-hover:to-white/10 transition-all duration-300
          ${!isRouteActive(to) ? "opacity-100" : "opacity-0"}`}
        />
        <Icon
          className={`w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110
          ${
            isRouteActive(to)
              ? "text-white"
              : "text-gray-400 group-hover:text-white"
          }`}
        />
        <span
          className={`ml-3 truncate relative z-10 transition-all duration-300
          ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
        >
          {label}
        </span>
      </Link>
    </li>
  );

  // Get the menu configuration for the current user role
  const roleMenus = menuConfig[user?.role] || menuConfig.student; // Default to student if role not found

  return (
    <div className="relative w-full">
      {!isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden 
            transition-opacity duration-300"
          onClick={() => setIsOpen(true)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-900 transition-all duration-300 ease-in-out 
          ${isOpen ? "w-[20vw]" : "w-20"} z-30 border-r border-gray-800/50 
          flex flex-col overflow-hidden shadow-xl shadow-black/20`}
      >
        <div
          className="h-16 flex items-center justify-between px-4 border-b border-gray-800/50 
          flex-shrink-0 bg-gradient-to-b from-gray-900 to-gray-900/95"
        >
          <div className="flex items-center">
            <FaGraduationCap
              className="text-blue-500 w-7 h-7 transition-transform duration-300 
              hover:scale-110"
            />
            <span
              className={`ml-3 font-semibold text-white text-lg tracking-wide
              transition-all duration-300 ${
                !isOpen && "opacity-0 -translate-x-4"
              }`}
            >
              EduPanel
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-2">
            {roleMenus.main && (
              <MenuGroup title="Main" items={roleMenus.main} />
            )}
            {roleMenus.academic && (
              <MenuGroup title="Academic" items={roleMenus.academic} />
            )}
            {roleMenus.attendance && (
              <MenuGroup title="Attendance" items={roleMenus.attendance} />
            )}
            {roleMenus.communication && (
              <MenuGroup
                title="Communication"
                items={roleMenus.communication}
              />
            )}
            {roleMenus.finance && (
              <MenuGroup title="Finance" items={roleMenus.finance} />
            )}
            {roleMenus.transport && (
              <MenuGroup title="Transport" items={roleMenus.transport} />
            )}
          </div>
        </nav>

        <div
          className="border-t border-gray-800/50 bg-gradient-to-b from-gray-900/95 to-gray-900 
          backdrop-blur flex-shrink-0 shadow-lg"
        >
          <div className="p-4">
            <Link
              to="/profile"
              className="flex items-center space-x-3 hover:bg-gray-800/30 p-2.5 rounded-xl 
                transition-all duration-300 group relative overflow-hidden"
            >
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 
                flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20
                transition-transform duration-300 group-hover:scale-105"
              >
                <FaUser className="w-5 h-5 text-white" />
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0 transition-all duration-300">
                  <p className="text-sm font-medium text-white truncate group-hover:text-blue-400">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate group-hover:text-gray-300">
                    View Profile
                  </p>
                </div>
              )}
              <div
                className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 
                group-hover:from-white/5 group-hover:to-white/10 transition-all duration-300"
              />
            </Link>
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center space-x-3 text-red-400 hover:text-red-300 
                hover:bg-red-500/10 w-full p-2.5 rounded-xl transition-all duration-300
                group relative overflow-hidden"
            >
              <FaSignOutAlt
                className="w-5 h-5 relative z-10 transition-transform duration-300 
                group-hover:scale-110"
              />
              {isOpen && <span className="truncate relative z-10">Logout</span>}
              <div
                className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 
                group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all duration-300"
              />
            </button>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-gray-900 text-white lg:hidden 
          hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-black/20
          hover:shadow-black/40"
      >
        <FaBars className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Sidebar;
