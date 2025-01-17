import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import {
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Modal,
  CircularProgress,
} from "@mui/material";
import { FiSettings, FiClock, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import TimeTableService from "../services/timeTableServices";
import { getAllClasses } from "../services/classService";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";
import { selectUser } from "../store/slices/userSlice";
import { useSelector } from "react-redux";

const localizer = momentLocalizer(moment);

const PRESET_TIMES = {
  "School Hours (8AM-3PM)": { start: "08:00 AM", end: "03:00 PM" },
  "Morning Hours (8AM-12PM)": { start: "08:00 AM", end: "12:00 PM" },
  "Afternoon Hours (12PM-5PM)": { start: "12:00 PM", end: "05:00 PM" },
  "Full Day (7AM-7PM)": { start: "07:00 AM", end: "07:00 PM" },
};

const SUBJECTS = [
  { name: "Math", color: "#1976d2" },
  { name: "Science", color: "#2e7d32" },
  { name: "English", color: "#ed6c02" },
  { name: "History", color: "#9c27b0" },
  { name: "Physics", color: "#d32f2f" },
];

const TimeTable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [events, setEvents] = useState([]);
  const [startTime, setStartTime] = useState(
    moment().set({ hour: 9, minute: 0 })
  );
  const [endTime, setEndTime] = useState(moment().set({ hour: 17, minute: 0 }));
  const [showSettings, setShowSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [timeTables, setTimeTables] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingTimetables, setIsLoadingTimetables] = useState(false);
  const [isDeletingTimetable, setIsDeletingTimetable] = useState(null);
  const showToast = useToast();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // Fetch all classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch classes for dropdown
  const fetchClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const response = await getAllClasses();
      setClasses(response.data);

      // Set first class as default if available
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]._id);
        fetchTimeTables(response.data[0]._id);
      }
    } catch (error) {
      showToast("Error fetching classes", "error");
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // Fetch timetables for a specific class
  const fetchTimeTables = async (classId) => {
    setIsLoadingTimetables(true);
    try {
      const timetableData = await TimeTableService.getClassTimeTable(classId);
      showToast("Time table data fetched successfully", "success");

      // Store raw timetable data
      setTimeTables(timetableData.data);

      // Transform timetable data into calendar events
      const formattedEvents = timetableData.data.flatMap((daySchedule) =>
        daySchedule.periods.map((period) => {
          const startDateTime = moment(
            `${daySchedule.day} ${period.startTime}`,
            "dddd hh:mm A"
          );
          const endDateTime = moment(
            `${daySchedule.day} ${period.endTime}`,
            "dddd hh:mm A"
          );

          return {
            id: daySchedule._id,
            title: `${period.subject} - ${period.teacher.name}`,
            subject: period.subject,
            start: startDateTime.toDate(),
            end: endDateTime.toDate(),
            color:
              SUBJECTS.find((s) => s.name === period.subject)?.color ||
              "#1976d2",
            timetableId: daySchedule._id,
          };
        })
      );

      setEvents(formattedEvents);
    } catch (error) {
      showToast("Time Table Not Available", "error");
      console.error("Error fetching timetables:", error);
      setEvents([]);
      setTimeTables([]);
    } finally {
      setIsLoadingTimetables(false);
    }
  };

  // Handle class selection change
  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    fetchTimeTables(classId);
  };

  // Handle Delete Timetable
  const handleDeleteTimeTable = async (timetableId) => {
    setIsDeletingTimetable(timetableId);
    try {
      await TimeTableService.deleteTimeTable(timetableId);
      showToast("Timetable deleted successfully", "success");
      // Refresh timetables for the selected class
      fetchTimeTables(selectedClass);
    } catch (error) {
      showToast("Error deleting timetable", "error");
      console.error("Error deleting timetable:", error);
    } finally {
      setIsDeletingTimetable(null);
    }
  };

  const handlePresetClick = (preset) => {
    const { start, end } = PRESET_TIMES[preset];
    setStartTime(moment(start, "hh:mm A"));
    setEndTime(moment(end, "hh:mm A"));
    setAnchorEl(null);
  };

  const minTime = startTime.toDate();
  const maxTime = endTime.toDate();

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color || "#1976d2",
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontWeight: "500",
        padding: "4px 8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        cursor: "pointer",
      },
    };
  };

  if (isLoadingClasses) {
    return <Loader />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#1976d2",
          fontWeight: "bold",
          mb: 3,
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Class Timetable
      </Typography>

      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          p: 3,
          bgcolor: "white",
          borderRadius: "12px",
          mb: 2,
          position: "relative",
        }}
      >
        {/* Loading overlay for timetable data */}
        {isLoadingTimetables && <Loader />}

        {/* Class Selection Dropdown */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <FormControl variant="outlined" sx={{ minWidth: 300 }}>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={handleClassChange}
              label="Select Class"
              disabled={isLoadingTimetables}
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem._id} value={classItem._id}>
                  {`${classItem.name} - ${classItem.section}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FiSettings />}
              onClick={() => setShowSettings(!showSettings)}
              sx={{
                bgcolor: showSettings ? "#1565c0" : "#1976d2",
                "&:hover": { bgcolor: "#1565c0" },
              }}
              disabled={isLoadingTimetables}
            >
              Time Settings
            </Button>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                color: "#1976d2",
                bgcolor: "#e3f2fd",
                "&:hover": { bgcolor: "#bbdefb" },
              }}
              disabled={isLoadingTimetables}
            >
              <FiClock />
            </IconButton>
          </Box>
          {(user?.role === "admin" || user?.role === "superAdmin") && (
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={() => navigate("/add-class-timetable")}
              sx={{
                bgcolor: "#2e7d32",
                "&:hover": { bgcolor: "#1b5e20" },
              }}
              disabled={isLoadingTimetables}
            >
              Add Class Time Table
            </Button>
          )}
        </Box>

        {showSettings && (
          <Paper
            elevation={2}
            sx={{
              mb: 3,
              p: 3,
              bgcolor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    minutesStep={30}
                    ampm
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        sx: { bgcolor: "white" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    to
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    minutesStep={30}
                    ampm
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        sx: { bgcolor: "white" },
                      },
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setShowSettings(false)}
                    sx={{
                      borderColor: "#1976d2",
                      color: "#1976d2",
                      "&:hover": {
                        borderColor: "#1565c0",
                        bgcolor: "#e3f2fd",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setShowSettings(false)}
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": {
                        bgcolor: "#1565c0",
                      },
                    }}
                  >
                    Apply
                  </Button>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Paper>
        )}

        <Box
          sx={{
            ".rbc-header": {
              bgcolor: "#f5f5f5",
              py: 1.5,
              fontWeight: "bold",
            },
            ".rbc-time-header": {
              borderRadius: "8px 8px 0 0",
            },
            ".rbc-time-content": {
              borderRadius: "0 0 8px 8px",
            },
            ".rbc-today": {
              bgcolor: "#e3f2fd",
            },
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            defaultView="week"
            views={["week", "day"]}
            min={minTime}
            max={maxTime}
            step={30}
            timeslots={2}
            eventPropGetter={eventStyleGetter}
          />
        </Box>

        {/* Timetable List with Edit and Delete Buttons */}
        {(user?.role === "admin" || user?.role === "superAdmin") && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Timetables
            </Typography>
            {timeTables.map((timetable) => (
              <Paper
                key={timetable._id}
                elevation={2}
                sx={{
                  p: 2,
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography>
                  {timetable.day} - {timetable.class.name}{" "}
                  {timetable.class.section}
                </Typography>

                <Box>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/edit-timetable/${timetable._id}`)}
                    disabled={isDeletingTimetable === timetable._id}
                  >
                    <FiEdit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteTimeTable(timetable._id)}
                    disabled={isDeletingTimetable === timetable._id}
                  >
                    {isDeletingTimetable === timetable._id ? (
                      <CircularProgress size={20} color="error" />
                    ) : (
                      <FiTrash2 />
                    )}
                  </IconButton>
                </Box>
              </Paper>
            ))}
            {timeTables.length === 0 && !isLoadingTimetables && (
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <Typography color="textSecondary">
                  No timetables available for this class
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<FiPlus />}
                  onClick={() => navigate("/add-class-timetable")}
                  sx={{ mt: 2 }}
                >
                  Add Timetable
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, minWidth: 200 },
        }}
      >
        {Object.keys(PRESET_TIMES).map((preset) => (
          <MenuItem
            key={preset}
            onClick={() => handlePresetClick(preset)}
            sx={{
              py: 1,
              "&:hover": { bgcolor: "#e3f2fd" },
            }}
          >
            {preset}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default TimeTable;
