import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
// import DigitalClock from "../DigitalClock";

const StudentAttendanceList = () => {
  const initialStudentsData = [
    {
      id: 1,
      name: "Aarav Kumar",
      rollNumber: 1,
      date: "2024-11-06",
      time: "09:15",
      status: "Present",
    },
    {
      id: 2,
      name: "Riya Singh",
      rollNumber: 2,
      date: "2024-11-06",
      time: "09:45",
      status: "Absent",
    },
    {
      id: 3,
      name: "Dev Mehta",
      rollNumber: 3,
      date: "2024-11-06",
      time: "09:00",
      status: "Present",
    },
    {
      id: 4,
      name: "Sneha Patel",
      rollNumber: 4,
      date: "2024-11-07",
      time: "09:10",
      status: "Present",
    },
    {
      id: 5,
      name: "Kunal Sharma",
      rollNumber: 5,
      date: "2024-11-07",
      time: "09:30",
      status: "Absent",
    },
    {
      id: 6,
      name: "Priya Desai",
      rollNumber: 6,
      date: "2024-11-07",
      time: "08:55",
      status: "Present",
    },
    {
      id: 7,
      name: "Anjali Nair",
      rollNumber: 7,
      date: "2024-11-08",
      time: "09:05",
      status: "Present",
    },
    {
      id: 8,
      name: "Rahul Verma",
      rollNumber: 8,
      date: "2024-11-08",
      time: "09:00",
      status: "Present",
    },
    {
      id: 9,
      name: "Meera Iyer",
      rollNumber: 9,
      date: "2024-11-08",
      time: "09:40",
      status: "Absent",
    },
    {
      id: 10,
      name: "Kabir Joshi",
      rollNumber: 10,
      date: "2024-11-08",
      time: "09:15",
      status: "Present",
    },
    {
      id: 11,
      name: "Sanya Gupta",
      rollNumber: 11,
      date: "2024-11-08",
      time: "09:20",
      status: "Present",
    },
    {
      id: 12,
      name: "Aditya Rao",
      rollNumber: 12,
      date: "2024-11-08",
      time: "09:50",
      status: "Absent",
    },
    {
      id: 13,
      name: "Ishita Reddy",
      rollNumber: 13,
      date: "2024-11-08",
      time: "09:08",
      status: "Present",
    },
    {
      id: 14,
      name: "Vikram Chawla",
      rollNumber: 14,
      date: "2024-11-08",
      time: "09:45",
      status: "Absent",
    },
    {
      id: 15,
      name: "Neha Jain",
      rollNumber: 15,
      date: "2024-11-08",
      time: "09:12",
      status: "Present",
    },
  ];

  const today = new Date().toISOString().split("T")[0];
  const [students, setStudents] = useState(initialStudentsData);
  const [selectedDate, setSelectedDate] = useState(today);
  const [sortBy, setSortBy] = useState("none");
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    if (selectedDate) {
      const filteredStudents = initialStudentsData.filter(
        (student) => student.date === selectedDate
      );
      setStudents(filteredStudents);
      if (filteredStudents.length === 0) {
        showToast(`No attendance records found for ${selectedDate}`, "info");
      } else {
        showToast(`Found ${filteredStudents.length} attendance records`, "success");
      }
    } else {
      setStudents(initialStudentsData);
    }
  }, [selectedDate]);

  const sortStudents = (criteria) => {
    setSortBy(criteria);
    let sortedStudents = [...students];

    try {
      switch (criteria) {
        case "name-asc":
          sortedStudents.sort((a, b) => a.name.localeCompare(b.name));
          showToast("Sorted by name (A-Z)", "success");
          break;
        case "roll-asc":
          sortedStudents.sort((a, b) => a.rollNumber - b.rollNumber);
          break;
        case "roll-desc":
          sortedStudents.sort((a, b) => b.rollNumber - a.rollNumber);
          break;
        case "date-asc":
          sortedStudents.sort((a, b) => {
            const dateA = new Date(a.date + "T" + a.time);
            const dateB = new Date(b.date + "T" + b.time);
            return dateA - dateB;
          });
          break;
        case "date-desc":
          sortedStudents.sort((a, b) => {
            const dateA = new Date(a.date + "T" + a.time);
            const dateB = new Date(b.date + "T" + b.time);
            return dateB - dateA;
          });
          break;
        case "time-asc":
          sortedStudents.sort((a, b) => a.time.localeCompare(b.time));
          break;
        case "time-desc":
          sortedStudents.sort((a, b) => b.time.localeCompare(a.time));
          break;
        default:
          return;
      }
      setStudents(sortedStudents);
    } catch (error) {
      showToast("Error sorting students", "error");
      console.error("Sorting error:", error);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    showToast(`Viewing attendance for ${event.target.value}`, "info");
  };

  const resetFilters = () => {
    setSelectedDate("");
    setSortBy("none");
    setStudents(initialStudentsData);
    showToast("Filters reset successfully", "success");
  };

  const formatDateTime = (dateString, timeString) => {
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const formattedTime = timeString
        ? new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "";

      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      showToast("Error formatting date/time", "error");
      console.error("Error formatting date/time:", error);
      return { date: dateString, time: timeString };
    }
  };

  return (
    <Box className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Teacher Attendance</h1>
        {/* <DigitalClock /> */}
      </div>

      <Box className="flex flex-col md:flex-row gap-4 mb-4">
        <TextField
          type="date"
          label="Filter by Date"
          value={selectedDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            max: today,
          }}
          className="w-full md:w-48"
        />

        <FormControl className="w-full md:w-48">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => sortStudents(e.target.value)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
            <MenuItem value="roll-asc">Roll Number (Asc)</MenuItem>
            <MenuItem value="roll-desc">Roll Number (Desc)</MenuItem>
            <MenuItem value="date-asc">Date & Time (Oldest First)</MenuItem>
            <MenuItem value="date-desc">Date & Time (Newest First)</MenuItem>
            <MenuItem value="time-asc">Time (Earliest First)</MenuItem>
            <MenuItem value="time-desc">Time (Latest First)</MenuItem>
          </Select>
        </FormControl>

        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Reset Filters
        </button>
        <button
          onClick={() => navigate("/teacher-list")}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Take Attendance
        </button>
      </Box>

      <TableContainer component={Paper} className="mt-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Roll Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Attendance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students&&students.length > 0 ? (
              students&&students.map((student) => {
                const { date, time } = formatDateTime(
                  student.date,
                  student.time
                );
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{date}</TableCell>
                    <TableCell>{time}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded ${
                          student.status === "Present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No students found for the selected date
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentAttendanceList;
