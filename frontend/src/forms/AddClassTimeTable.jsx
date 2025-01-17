import React, { useEffect, useState } from "react";
import {
  Grid,
  Select,
  MenuItem,
  Button,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Box,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { getAllClasses, getClassById } from "../services/classService";
import TimeTableService from "../services/timeTableServices";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const AddClassTimeTable = ({ onTimeTableAdded }) => {
  const [newTimeTable, setNewTimeTable] = useState({
    classId: "",
    day: "",
    periods: [
      {
        periodNumber: 1,
        subject: "",
        subjectId: "",
        teacher: "",
        startTime: "",
        endTime: "",
      },
    ],
  });

  const [classes, setClasses] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [freeTeachers, setFreeTeachers] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await getAllClasses();
      setClasses(response.data);
    } catch (error) {
      showToast("Error fetching classes", "error");
    }
  };

  const handleClassSelection = async (classId) => {
    try {
      // Fetch full class details
      const classData = await getClassById(classId);
      console.log("classData", classData.data.subjects);

      // Set subjects for the selected class
      setClassSubjects(classData.data.subjects || []);

      // Reset and update timetable
      setNewTimeTable((prev) => ({
        ...prev,
        classId: classId,
        periods: [
          {
            periodNumber: 1,
            subject: "",
            subjectId: "",
            teacher: "",
            startTime: "",
            endTime: "",
          },
        ],
      }));
    } catch (error) {
      handleNotification("Error fetching class details", "error");
    }
  };

  const fetchFreeTeachers = async (periodIndex, day, periodNumber) => {
    try {
      console.log("newTimeTable", newTimeTable);
      console.log(
        `Fetching free teachers for Day: ${day}, Period: ${periodNumber}`
      );
      const response = await TimeTableService.getFindFreeTeacher(
        day,
        periodNumber
      );

      console.log("Free Teachers Response:", response);

      // Filter free teachers based on the selected subject's teacher type/department
      const currentSubject = newTimeTable.periods[periodIndex];
      console.log("currentSubject", currentSubject);
      const filteredFreeTeachers = response.freeTeachers.filter(
        (teacher) => teacher.department === currentSubject?.teacher.department
      );

      console.log("Filtered Free Teachers:", filteredFreeTeachers);

      setFreeTeachers(filteredFreeTeachers || []);
    } catch (error) {
      console.error("Error fetching free teachers:", error);
      showToast("Error fetching free teachers", "error");
    }
  };

  const handleSubjectSelection = (periodIndex, subject) => {
    console.log("subject", subject);
    if (!subject.teacher) {
      showToast("No teacher available for this subject", "warning");
    }
    const newPeriods = [...newTimeTable.periods];
    newPeriods[periodIndex] = {
      ...newPeriods[periodIndex],
      subject: subject.subjectName,
      subjectId: subject._id,
      teacher: subject.teacher._id,
    };

    setNewTimeTable((prev) => ({
      ...prev,
      periods: newPeriods,
    }));

    // Fetch free teachers if day is selected
    if (newTimeTable.day) {
      fetchFreeTeachers(periodIndex, newTimeTable.day, periodIndex + 1);
    }
  };

  const handleTeacherSelection = (periodIndex, teacherId) => {
    const newPeriods = [...newTimeTable.periods];
    newPeriods[periodIndex].teacher = teacherId;

    setNewTimeTable((prev) => ({
      ...prev,
      periods: newPeriods,
    }));
  };

  const addPeriod = () => {
    if (newTimeTable.periods.length < 8) {
      setNewTimeTable((prev) => ({
        ...prev,
        periods: [
          ...prev.periods,
          {
            periodNumber: prev.periods.length + 1,
            subject: "",
            subjectId: "",
            teacher: "",
            startTime: "",
            endTime: "",
          },
        ],
      }));
    } else {
      handleNotification("Maximum 8 periods allowed", "warning");
    }
  };

  const handleDaySelection = (day) => {
    // Reset free teachers when day changes
    setFreeTeachers([]);

    // Update timetable with new day
    setNewTimeTable((prev) => ({
      ...prev,
      day: day,
      periods: prev.periods.map((period) => ({
        ...period,
        teacher: "", // Reset teacher for all periods
      })),
    }));
  };

  const handleAddTimeTable = async () => {
    console.log("newTimeTable", newTimeTable);
    if (!newTimeTable.classId) {
      showToast("Please select a class", "error");
      return;
    }
    if (!newTimeTable.day) {
      showToast("Please select a day", "error");
      return;
    }
    if (
      newTimeTable.periods.some(
        (p) => !p.subjectId || !p.startTime || !p.endTime || !p.teacher
      )
    ) {
      showToast("Please fill in all period details", "error");
      return;
    }

    try {
      await TimeTableService.addTimeTable(newTimeTable);
      showToast("Timetable added successfully", "success");
      // Reset form and navigate back
      setNewTimeTable({
        classId: "",
        day: "",
        periods: [
          {
            periodNumber: 1,
            subject: "",
            subjectId: "",
            teacher: "",
            startTime: "",
            endTime: "",
          },
        ],
      });
      setClassSubjects([]);
      setFreeTeachers([]);
      onTimeTableAdded && onTimeTableAdded();
      navigate(-1);
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    }
  };

  const handleNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          Create Class Timetable
        </Typography>

        <Grid container spacing={3}>
          {/* Class Selection */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Class
            </Typography>
            <Select
              fullWidth
              value={newTimeTable.classId}
              onChange={(e) => handleClassSelection(e.target.value)}
              sx={{
                backgroundColor: "background.paper",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name} - {cls.section}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Day Selection */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Day
            </Typography>
            <Select
              fullWidth
              value={newTimeTable.day}
              onChange={(e) => handleDaySelection(e.target.value)}
              sx={{
                backgroundColor: "background.paper",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          {newTimeTable.periods.map((period, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Period {index + 1}
                </Typography>
                {index > 0 && (
                  <Tooltip title="Remove Period">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newPeriods = newTimeTable.periods.filter(
                          (_, i) => i !== index
                        );
                        setNewTimeTable((prev) => ({
                          ...prev,
                          periods: newPeriods,
                        }));
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Subject
                  </Typography>
                  <Select
                    fullWidth
                    value={period.subjectId}
                    onChange={(e) => {
                      const selectedSubject = classSubjects.find(
                        (subject) => subject._id === e.target.value
                      );
                      handleSubjectSelection(index, selectedSubject);
                    }}
                    disabled={!newTimeTable.day}
                    sx={{ backgroundColor: "background.paper" }}
                  >
                    {classSubjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.subjectName}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                {period.subjectId && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Teacher
                    </Typography>
                    <Select
                      fullWidth
                      value={period.teacher}
                      onChange={(e) =>
                        handleTeacherSelection(index, e.target.value)
                      }
                      sx={{ backgroundColor: "background.paper" }}
                    >
                      {freeTeachers.map((teacher) => (
                        <MenuItem key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.subject})
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Start Time"
                      value={
                        period.startTime
                          ? dayjs(period.startTime, "hh:mm A")
                          : null
                      }
                      onChange={(newValue) => {
                        const formattedTime = newValue
                          ? newValue.format("hh:mm A")
                          : "";
                        const newPeriods = [...newTimeTable.periods];
                        newPeriods[index].startTime = formattedTime;
                        setNewTimeTable((prev) => ({
                          ...prev,
                          periods: newPeriods,
                        }));
                      }}
                      sx={{ width: "100%" }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="End Time"
                      value={
                        period.endTime ? dayjs(period.endTime, "hh:mm A") : null
                      }
                      onChange={(newValue) => {
                        const formattedTime = newValue
                          ? newValue.format("hh:mm A")
                          : "";
                        const newPeriods = [...newTimeTable.periods];
                        newPeriods[index].endTime = formattedTime;
                        setNewTimeTable((prev) => ({
                          ...prev,
                          periods: newPeriods,
                        }));
                      }}
                      sx={{ width: "100%" }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addPeriod}
            disabled={!newTimeTable.classId || !newTimeTable.day}
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Add Period
          </Button>

          <Button
            variant="contained"
            onClick={handleAddTimeTable}
            disabled={!newTimeTable.classId || !newTimeTable.day}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 4,
            }}
          >
            Save Timetable
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddClassTimeTable;
