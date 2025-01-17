import React, { useEffect, useState } from "react";
import {
  Grid,
  Select,
  MenuItem,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Divider,
  Container,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { getAllClasses, getClassById } from "../services/classService";
import TimeTableService from "../services/timeTableServices";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Loader from "../components/Loader/Loader";

const EditClassTimeTable = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingClass, setIsLoadingClass] = useState(false);

  const [editTimeTable, setEditTimeTable] = useState({
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

  // Convert 12-hour time to 24-hour time
  const convertTo24HourFormat = (time12h) => {
    if (!time12h) return "";
    return dayjs(time12h, "hh:mm A").format("HH:mm");
  };

  // Fetch existing timetable data and classes on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Fetch all classes
        const classesResponse = await getAllClasses();
        setClasses(classesResponse.data);

        // Fetch existing timetable details
        const timetableResponse = await TimeTableService.getTimetableById(id);

        // Prepare the timetable for editing
        setEditTimeTable({
          classId: timetableResponse.class._id,
          day: timetableResponse.day,
          periods: timetableResponse.periods.map((period) => ({
            periodNumber: period.periodNumber,
            subject: period.subject,
            subjectId: period.subject,
            teacher: period.teacher._id,
            startTime: convertTo24HourFormat(period.startTime),
            endTime: convertTo24HourFormat(period.endTime),
          })),
        });

        // Fetch class details to get subjects
        const classData = await getClassById(timetableResponse.class._id);
        setClassSubjects(classData.data.subjects || []);
      } catch (error) {
        showToast(`Error fetching timetable: ${error.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [id, showToast]);

  const handleClassSelection = async (classId) => {
    try {
      if (!classId) return;

      setIsLoadingClass(true);
      // Fetch full class details
      const classData = await getClassById(classId);

      // Set subjects for the selected class
      setClassSubjects(classData.data.subjects || []);

      // Reset and update timetable
      setEditTimeTable((prev) => ({
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
      showToast("Error fetching class details", "error");
    } finally {
      setIsLoadingClass(false);
    }
  };

  const handleSubjectSelection = (periodIndex, subject) => {
    if (!subject) return;

    const newPeriods = [...editTimeTable.periods];
    newPeriods[periodIndex] = {
      ...newPeriods[periodIndex],
      subject: subject.subjectName,
      subjectId: subject._id,
      teacher: subject.teacher?._id || "",
    };

    setEditTimeTable((prev) => ({
      ...prev,
      periods: newPeriods,
    }));
  };

  const addPeriod = () => {
    if (editTimeTable.periods.length < 8) {
      setEditTimeTable((prev) => ({
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
      showToast("Maximum 8 periods allowed", "warning");
    }
  };

  const handleUpdateTimeTable = async () => {
    // Validation checks
    if (!editTimeTable.classId) {
      showToast("Please select a class", "error");
      return;
    }
    if (!editTimeTable.day) {
      showToast("Please select a day", "error");
      return;
    }
    if (
      editTimeTable.periods.some(
        (p) => !p.subjectId || !p.startTime || !p.endTime
      )
    ) {
      showToast("Please fill in all period details", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      // Prepare the payload
      const payload = {
        class: editTimeTable.classId,
        day: editTimeTable.day,
        periods: editTimeTable.periods.map((period) => ({
          periodNumber: period.periodNumber,
          subject: period.subject,
          teacher: period.teacher,
          startTime: period.startTime,
          endTime: period.endTime,
        })),
      };

      // Update the timetable
      await TimeTableService.updateTimeTable(id, payload);
      showToast("Timetable updated successfully", "success");
      navigate(-1);
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 4, fontWeight: "medium", color: "primary.main" }}
        >
          Edit Class Timetable
        </Typography>

        <Grid container spacing={3}>
          {/* Class and Day Selection Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "medium" }}
              >
                Class
              </Typography>
              <Select
                fullWidth
                value={editTimeTable.classId || ""}
                onChange={(e) => handleClassSelection(e.target.value)}
                disabled={isLoadingClass}
                sx={{
                  backgroundColor: "background.paper",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name} - {cls.section}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "medium" }}
              >
                Day
              </Typography>
              <Select
                fullWidth
                value={editTimeTable.day || ""}
                onChange={(e) =>
                  setEditTimeTable((prev) => ({
                    ...prev,
                    day: e.target.value,
                  }))
                }
                disabled={isLoadingClass}
                sx={{
                  backgroundColor: "background.paper",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.12)",
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
            </Box>
          </Grid>

          {/* Loading indicator for class selection */}
          {isLoadingClass && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            </Grid>
          )}

          {/* Periods Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "medium" }}>
              Periods
            </Typography>

            {editTimeTable.periods.map((period, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: "grey.50",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                  Period {index + 1}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Subject
                    </Typography>
                    <Select
                      fullWidth
                      value={period.subjectId || ""}
                      onChange={(e) => {
                        const selectedSubject = classSubjects.find(
                          (subject) => subject._id === e.target.value
                        );
                        handleSubjectSelection(index, selectedSubject);
                      }}
                      disabled={isLoadingClass}
                      sx={{ backgroundColor: "background.paper" }}
                    >
                      {classSubjects.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.subjectName}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Teacher
                    </Typography>
                    <TextField
                      fullWidth
                      value={period.teacher}
                      disabled
                      sx={{ backgroundColor: "background.paper" }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="Start Time"
                        value={
                          period.startTime
                            ? dayjs(`2024-01-01 ${period.startTime}`)
                            : null
                        }
                        onChange={(newValue) => {
                          const formattedTime = newValue
                            ? newValue.format("hh:mm A")
                            : "";
                          const newPeriods = [...editTimeTable.periods];
                          newPeriods[index] = {
                            ...newPeriods[index],
                            startTime: formattedTime,
                          };
                          setEditTimeTable((prev) => ({
                            ...prev,
                            periods: newPeriods,
                          }));
                        }}
                        disabled={isLoadingClass}
                        sx={{ width: "100%" }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="End Time"
                        value={
                          period.endTime
                            ? dayjs(`2024-01-01 ${period.endTime}`)
                            : null
                        }
                        onChange={(newValue) => {
                          const formattedTime = newValue
                            ? newValue.format("hh:mm A")
                            : "";
                          const newPeriods = [...editTimeTable.periods];
                          newPeriods[index] = {
                            ...newPeriods[index],
                            endTime: formattedTime,
                          };
                          setEditTimeTable((prev) => ({
                            ...prev,
                            periods: newPeriods,
                          }));
                        }}
                        disabled={isLoadingClass}
                        sx={{ width: "100%" }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={addPeriod}
                disabled={
                  !editTimeTable.classId || isLoadingClass || isSubmitting
                }
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Add Period
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateTimeTable}
                disabled={
                  !editTimeTable.classId || isLoadingClass || isSubmitting
                }
                startIcon={
                  isSubmitting && <CircularProgress size={20} color="inherit" />
                }
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 4,
                }}
              >
                {isSubmitting ? "Updating..." : "Update Timetable"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Backdrop loading for submission */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default EditClassTimeTable;
