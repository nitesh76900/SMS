import { BrowserRouter, Routes, Route } from "react-router-dom";

import AddConnectionForm from "./forms/AddConnectionForm";
import Connections from "./pages/Connections";
import LoginPage from "./pages/Login";
import Layout from "./components/Layout/Layout";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Students from "./pages/Students";
import AddmissionForm from "./forms/AddmissionForm";
import Teachers from "./pages/Teachers";
import AddTeachersForm from "./forms/AddTeachersForm";
import StudentAttendenceList from "./pages/StudentAttendenceList";
import AttendancePage from "./pages/AttendencePage";
import StudentMarksPage from "./pages/StudentMarksPage";
import Profile from "./pages/Profile";
import ParentsPage from "./pages/ParentPage";
import Notices from "./pages/Notices";
import StudentResultPage from "./pages/StudentResultPage";
import AttendanceCalendar from "./pages/AttendanceCalendar";
import StudentFeeManagementPage from "./pages/StudentFeeManagementPage";
import StudentList from "./pages/StudentListAttendanceSytem";
import TeacherAttendance from "./pages/TeacherListAttendanceSystem";
import AssesmentQuestions from "./pages/AssesmentQuestions";
import AssessmentResult from "./pages/AssesmentResult";
import TestForm from "./forms/TestForm";
import LiveSessionManagement from "./pages/LiveSession";
import DashboardPage from "./pages/Staff";
import DepartmentPage from "./pages/DepartmentPage";
import StaffListPage from "./pages/StaffListPage";
import AddStaffForm from "./pages/AddStaffForm";
import StaffDetailView from "./pages/StaffDetailPage";
import StaffAttendance from "./pages/StaffAttendance";
import StudentAssessmentResults from "./pages/StudentsAssessmentResults";
import Class from "./pages/Class";
import AddClassForm from "./pages/AddClassForm";
import EditTeachersForm from "./forms/EditTeachersForm";
import TeacherDetail from "./pages/TeacherDetail";
import TransportManagement from "./pages/TransportManagement";
import AddStudentMarksForm from "./forms/AddStudentMarksForm";
import ReceiptModal from "./modals/ReceiptModal";
import AddStudentFeeForm from "./forms/AddStudentFeeForm";
import EditStudentMarksModal from "./modals/EditStudentMarksModal";
import EditStudentForm from "./forms/EditStudentForm";
import TimeTable from "./pages/TimeTable";
import AddClassTimeTable from "./forms/AddClassTimeTable";
import EditClassTimeTable from "./forms/EditClassTimeTable";
import VehicleDetails from "./pages/TransportManagement/VehicleInfo";
import VehicleForm from "./pages/TransportManagement/VehicleForm";
import { fetchUser } from "./store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { selectUser } from "./store/slices/userSlice";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import VehicleTrackingPage from "./pages/VehicleTrackingPage";
import RouteForm from "./pages/TransportManagement/RouteForm";
import VehicleHistoriesPage from "./pages/VehicleHistoriesPage";
import ShowVehicleTracking from "./pages/ShowVehicleTracking";
import AddVehicleHistoryForm from "./forms/AddVehicleHistoryForm";
import Loader from "./components/Loader/Loader";
import ProtectedRoute from "./routes/ProtectedRoute";
import TestManagement from "./pages/TestManagement";

const App = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  const dispatch = useDispatch();

  const fetchUserAuth = () => {
    dispatch(fetchUser())
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchUserAuth();
  }, [dispatch]);

  useEffect(() => {
    console.log("user roleeeeeeeeee", user?.role);
    setRole(user?.role);
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/addConnection"
          element={
            <ProtectedRoute>
              <Layout>
                <AddConnectionForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <Layout>
                <Connections />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/class"
          element={
            <ProtectedRoute>
              <Layout>
                <Class />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-class"
          element={
            <ProtectedRoute>
              <Layout>
                <AddClassForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-student/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditStudentForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-marks"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentMarksPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-student-marks"
          element={
            <ProtectedRoute>
              <Layout>
                <AddStudentMarksForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-marks/:studentId"
          element={
            <ProtectedRoute>
              <Layout>
                <EditStudentMarksModal />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {role === "admin" || role === "superAdmin" ? (
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              ) : role === "teacher" ? (
                <Layout>
                  <TeacherDashboard />
                </Layout>
              ) : (
                <Layout>
                  <StudentDashboard />
                </Layout>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Layout>
                <Students />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/addmission-form"
          element={
            <ProtectedRoute>
              <Layout>
                <AddmissionForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <Layout>
                <Teachers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transport"
          element={
            <ProtectedRoute>
              <Layout>
                <TransportManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicle/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <VehicleDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-vehicle/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <VehicleForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-route-form"
          element={
            <ProtectedRoute>
              <Layout>
                <RouteForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-route-form/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <RouteForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicle-histories"
          element={
            <ProtectedRoute>
              <Layout>
                <VehicleHistoriesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-vehicle-history-form"
          element={
            <ProtectedRoute>
              <Layout>
                <AddVehicleHistoryForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/addteachers"
          element={
            <ProtectedRoute>
              <Layout>
                <AddTeachersForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TeacherDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditTeachersForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-staff"
          element={
            <ProtectedRoute>
              <Layout>
                <AddStaffForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents"
          element={
            <ProtectedRoute>
              <Layout>
                <ParentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-sessions"
          element={
            <ProtectedRoute>
              <Layout>
                <LiveSessionManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <AttendancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-departments"
          element={
            <ProtectedRoute>
              <Layout>
                <DepartmentPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <StaffAttendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-list/:department"
          element={
            <ProtectedRoute>
              <Layout>
                <StaffListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-detail/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <StaffDetailView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-list"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-list"
          element={
            <ProtectedRoute>
              <Layout>
                <TeacherAttendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <AttendanceCalendar />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/:classId"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentAttendenceList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <StaffAttendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notices"
          element={
            <ProtectedRoute>
              <Layout>
                <Notices />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/result"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentResultPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/fee-reminder"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentFeeManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-student-fee"
          element={
            <ProtectedRoute>
              <Layout>
                <AddStudentFeeForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-receipt/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ReceiptModal />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assesments"
          element={
            <ProtectedRoute>
              <Layout>
                <TestManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-form"
          element={
            <ProtectedRoute>
              <Layout>
                <TestForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/submission/all/:testId"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentAssessmentResults />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assesments/:testId"
          element={
            <ProtectedRoute>
              <Layout>
                <AssesmentQuestions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assesments-result/:submissionId"
          element={
            <ProtectedRoute>
              <Layout>
                <AssessmentResult />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/time-table"
          element={
            <ProtectedRoute>
              <Layout>
                <TimeTable />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-class-timetable"
          element={
            <ProtectedRoute>
              <Layout>
                <AddClassTimeTable />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-timetable/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditClassTimeTable />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicle-tracking/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <VehicleTrackingPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/show-tracking/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ShowVehicleTracking />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
