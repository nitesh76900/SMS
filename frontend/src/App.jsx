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
import TestManagement from "./pages/TestManagement";
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
import { Toaster } from "react-hot-toast";
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
import { fetchUser, setUser } from "./store/slices/userSlice";
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

const App = () => {
  const user = useSelector(selectUser);
  const [role, setRole] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUser()); // Call the thunk when the component mounts
  }, [dispatch]);
  useEffect(() => {
    console.log("user roleeeeeeeeee", user?.role);
    setRole(user?.role);
  }, [user]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/addConnection"
          element={
            <Layout>
              <AddConnectionForm />{" "}
            </Layout>
          }
        />
        <Route
          path="/connections"
          element={
            <Layout>
              <Connections />
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/class"
          element={
            <Layout>
              <Class />
            </Layout>
          }
        />
        <Route
          path="/add-class"
          element={
            <Layout>
              <AddClassForm />
            </Layout>
          }
        />
        <Route
          path="/edit-student/:id"
          element={
            <Layout>
              <EditStudentForm />
            </Layout>
          }
        />
        <Route
          path="/student-marks"
          element={
            <Layout>
              <StudentMarksPage />
            </Layout>
          }
        />
        <Route
          path="/add-student-marks"
          element={
            <Layout>
              <AddStudentMarksForm />
            </Layout>
          }
        />
        <Route
          path="/edit-marks/:studentId"
          element={
            <Layout>
              <EditStudentMarksModal />
            </Layout>
          }
        />

        <Route
          path="/dashboard"
          element={
            role === "admin" || role === "superAdmin" ? (
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
            )
          }
        />
        <Route
          path="/students"
          element={
            <Layout>
              <Students />
            </Layout>
          }
        />
        <Route
          path="/addmission-form"
          element={
            <Layout>
              <AddmissionForm />
            </Layout>
          }
        />
        <Route
          path="/teachers"
          element={
            <Layout>
              <Teachers />
            </Layout>
          }
        />
        <Route
          path="/transport"
          element={
            <Layout>
              <TransportManagement />
            </Layout>
          }
        />
        <Route
          path="/vehicle/:id"
          element={
            <Layout>
              <VehicleDetails />
            </Layout>
          }
        />
        <Route
          path="/edit-vehicle/:id"
          element={
            <Layout>
              <VehicleForm />
            </Layout>
          }
        />
        <Route
          path="/add-route-form"
          element={
            <Layout>
              <RouteForm />
            </Layout>
          }
        />
        <Route
          path="/edit-route-form/:id"
          element={
            <Layout>
              <RouteForm />
            </Layout>
          }
        />
        <Route
          path="/vehicle-histories"
          element={
            <Layout>
              <VehicleHistoriesPage />
            </Layout>
          }
        />
        <Route
          path="/add-vehicle-history-form"
          element={
            <Layout>
              <AddVehicleHistoryForm />
            </Layout>
          }
        />
        <Route
          path="/addteachers"
          element={
            <Layout>
              <AddTeachersForm />
            </Layout>
          }
        />
        <Route
          path="/teachers/:id"
          element={
            <Layout>
              <TeacherDetail />
            </Layout>
          }
        />
        <Route
          path="/teachers/edit/:id"
          element={
            <Layout>
              <EditTeachersForm />
            </Layout>
          }
        />
        <Route
          path="/add-staff"
          element={
            <Layout>
              <AddStaffForm />
            </Layout>
          }
        />
        <Route
          path="/parents"
          element={
            <Layout>
              <ParentsPage />
            </Layout>
          }
        />
        <Route
          // path="/parents"
          element={
            <Layout>
              <Toaster position="top-right" />
            </Layout>
          }
        />

        <Route
          path="/live-sessions"
          element={
            <Layout>
              <LiveSessionManagement />
            </Layout>
          }
        />

        <Route
          path="/attendance"
          element={
            <Layout>
              <AttendancePage />
            </Layout>
          }
        />
        <Route
          path="/staff"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/staff-departments"
          element={
            <Layout>
              <DepartmentPage />
            </Layout>
          }
        />
        <Route
          path="/staff-attendance"
          element={
            <Layout>
              <StaffAttendance />
            </Layout>
          }
        />
        <Route
          path="/staff-list/:department"
          element={
            <Layout>
              <StaffListPage />
            </Layout>
          }
        />
        <Route
          path="/staff-detail/:id"
          element={
            <Layout>
              <StaffDetailView />
            </Layout>
          }
        />
        <Route
          path="/student-list"
          element={
            <Layout>
              <StudentList />
            </Layout>
          }
        />
        <Route
          path="/teacher-list"
          element={
            <Layout>
              <TeacherAttendance />
            </Layout>
          }
        />
        <Route
          path="/attendance/calendar"
          element={
            <Layout>
              <AttendanceCalendar />
            </Layout>
          }
        />

        <Route
          path="/attendance/:classId"
          element={
            <Layout>
              <StudentAttendenceList />
            </Layout>
          }
        />
        <Route
          path="/staff-attendance"
          element={
            <Layout>
              <StaffAttendance />
            </Layout>
          }
        />
        <Route
          path="/notices"
          element={
            <Layout>
              <Notices />
            </Layout>
          }
        />
        <Route
          path="/result"
          element={
            <Layout>
              <StudentResultPage />
            </Layout>
          }
        />

        <Route
          path="/fee-reminder"
          element={
            <Layout>
              <StudentFeeManagementPage />
            </Layout>
          }
        />
        <Route
          path="/add-student-fee"
          element={
            <Layout>
              <AddStudentFeeForm />
            </Layout>
          }
        />
        <Route
          path="/view-receipt/:id"
          element={
            <Layout>
              <ReceiptModal />
            </Layout>
          }
        />
        <Route
          path="/assesments"
          element={
            <Layout>
              <TestManagement />
            </Layout>
          }
        />
        <Route
          path="/test-form"
          element={
            <Layout>
              <TestForm />
            </Layout>
          }
        />
        <Route
          path="/submission/all/:testId"
          element={
            <Layout>
              <StudentAssessmentResults />
            </Layout>
          }
        />
        <Route
          path="/assesments/:testId"
          element={
            <Layout>
              <AssesmentQuestions />
            </Layout>
          }
        />
        <Route
          path="/assesments-result/:submissionId"
          element={
            <Layout>
              <AssessmentResult />
            </Layout>
          }
        />
        <Route
          path="/time-table"
          element={
            <Layout>
              <TimeTable />
            </Layout>
          }
        />
        <Route
          path="/add-class-timetable"
          element={
            <Layout>
              <AddClassTimeTable />
            </Layout>
          }
        />
        <Route
          path="/edit-timetable/:id"
          element={
            <Layout>
              <EditClassTimeTable />
            </Layout>
          }
        />
        <Route
          path="/vehicle-tracking/:id"
          element={
            <Layout>
              <VehicleTrackingPage />
            </Layout>
          }
        />
        <Route
          path="/show-tracking/:id"
          element={
            <Layout>
              <ShowVehicleTracking/>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
