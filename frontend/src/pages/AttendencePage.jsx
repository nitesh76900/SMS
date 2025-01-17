import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, Tab, Button } from "@mui/material";
import TeachersAttendenceTable from "../components/UI/TeachersAttendenceTable";
import ClassList from "../components/UI/ClassList";
import { useNavigate } from "react-router-dom";
import DigitalClock from "../components/DigitalClock";
import TeacherList from "./TeacherListAttendanceSystem";
import { useToast } from "../context/ToastContext";

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const showToast = useToast();

  const handleCalendarClick = () => {
    navigate("/attendance/calendar");
    showToast("Viewing attendance calendar", "info");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    showToast(
      `Viewing ${newValue === 0 ? "Teachers" : "Students"} attendance`,
      "info"
    );
  };

  return (
    <div className="p-6">
      <div className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Students Attendance
        </h1>
        <DigitalClock />
      </div>
      {/* <Tabs
        value={activeTab}
        onChange={handleTabChange}
        right
      >
        <Tab label="Teachers" />
        <Tab label="Students" />
      
          {activeTab === 1&& (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCalendarClick}
              style={{ marginLeft: "auto" }}
            >
              Student Attendace Calendar
            </Button>
          )} 
      </Tabs> */}

      {/* {activeTab === 0 ? (
        <TeacherList />
      ) : ( */}
      <ClassList showActualAttendance={true} />
      {/* )} */}
    </div>
  );
};

export default AttendancePage;
