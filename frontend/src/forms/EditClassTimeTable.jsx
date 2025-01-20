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
  const [freeTeachers, setFreeTeachers] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Fetch all classes
        const classesResponse = await getAllClasses();
        setClasses(classesResponse.data);

        // Fetch existing timetable details
        const timetableResponse = await TimeTableService.getTimetableById(id);

        console.log("timetableResponse", timetableResponse);

        // Update the state with the fetched data
        setEditTimeTable({
          classId: timetableResponse.class._id,
          day: timetableResponse.day,
          periods: timetableResponse.periods.map((period) => {
            const matchedSubject = classSubjects.find(
              (subject) => subject.subjectName === period.subject
            );
            return {
              periodNumber: period.periodNumber,
              subject: period.subject,
              subjectId: matchedSubject?._id || "", // Use matched subject ID
              teacher: period.teacher.name,
              teacherId: period.teacher._id,
              startTime: period.startTime,
              endTime: period.endTime,
              _id: period._id,
            };
          }),
        });

        // Fetch class details to get subjects
        const classData = await getClassById(timetableResponse.class._id);
        // console.log("classData.data.subjects", classData.data.subjects);
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
      const classData = await getClassById(classId);
      setClassSubjects(classData.data.subjects || []);

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
      teacher: subject.teacher?.name || "",
      teacherId: subject.teacher?._id || "",
    };

    setEditTimeTable((prev) => ({
      ...prev,
      periods: newPeriods,
    }));

    // Fetch free teachers if day is selected
    if (editTimeTable.day) {
      fetchFreeTeachers(periodIndex, editTimeTable.day, periodIndex + 1);
    }
  };

  const handleTimeChange = (periodIndex, field, newValue) => {
    const formattedTime = newValue ? newValue.format("hh:mm A") : "";
    const newPeriods = [...editTimeTable.periods];
    newPeriods[periodIndex] = {
      ...newPeriods[periodIndex],
      [field]: formattedTime,
    };
    setEditTimeTable((prev) => ({
      ...prev,
      periods: newPeriods,
    }));
  };

  const handleTeacherSelection = (periodIndex, teacherId, teacherName) => {
    const newPeriods = [...editTimeTable.periods];
    newPeriods[periodIndex] = {
      ...newPeriods[periodIndex],
      teacher: teacherName,
      teacherId: teacherId,
    };

    setEditTimeTable((prev) => ({
      ...prev,
      periods: newPeriods,
    }));
  };

  const handleUpdateTimeTable = async () => {
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
        (p) => !p.subject || !p.startTime || !p.endTime
      )
    ) {
      showToast("Please fill in all period details", "error");
      return;
    }

    try {
      setIsSubmitting(true);  
      const payload = {
        class: editTimeTable.classId,
        day: editTimeTable.day,
        periods: editTimeTable.periods.map((period) => ({
          periodNumber: period.periodNumber,
          subject: period.subject,
          teacher: period.teacherId,
          startTime: period.startTime,
          endTime: period.endTime,
          _id: period._id,
        })),
      };

      await TimeTableService.updateTimeTable(id, payload);
      showToast("Timetable updated successfully", "success");
      navigate(-1);
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchFreeTeachers = async (periodIndex, day, periodNumber) => {
    try {
      const response = await TimeTableService.getFindFreeTeacher(
        day,
        periodNumber
      );

      // Filter free teachers based on subject department if needed
      const currentSubject = editTimeTable.periods[periodIndex];
      const filteredTeachers = response.freeTeachers.filter(
        (teacher) => teacher.department === currentSubject?.subject?.department
      );

      // Add the current teacher to the list if not already present
      const currentTeacher = editTimeTable.periods[periodIndex].teacherId;
      if (
        currentTeacher &&
        !filteredTeachers.find((t) => t._id === currentTeacher)
      ) {
        filteredTeachers.unshift({
          _id: currentTeacher,
          name: editTimeTable.periods[periodIndex].teacher,
        });
      }

      setFreeTeachers(filteredTeachers || []);
    } catch (error) {
      showToast("Error fetching free teachers", "error");
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
                value={editTimeTable.classId}
                onChange={(e) => handleClassSelection(e.target.value)}
                disabled={isLoadingClass}
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
                value={editTimeTable.day}
                onChange={(e) =>
                  setEditTimeTable((prev) => ({ ...prev, day: e.target.value }))
                }
                disabled={isLoadingClass}
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
                  Period {period.periodNumber}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
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
                      disabled={!editTimeTable.day}
                    >
                      {classSubjects.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.subjectName}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Teacher
                    </Typography>
                    <Select
                      fullWidth
                      value={period.teacherId || ""}
                      onChange={(e) => {
                        const selectedTeacher = freeTeachers.find(
                          (t) => t._id === e.target.value
                        );
                        handleTeacherSelection(
                          index,
                          e.target.value,
                          selectedTeacher?.name
                        );
                      }}
                      disabled={!editTimeTable.day || !period.subject}
                    >
                      {period.teacherId &&
                        period.teacher &&
                        !freeTeachers.find(
                          (t) => t._id === period.teacherId
                        ) && (
                          <MenuItem value={period.teacherId}>
                            {period.teacher} (Current)
                          </MenuItem>
                        )}
                      {freeTeachers.map((teacher) => (
                        <MenuItem key={teacher._id} value={teacher._id}>
                          {teacher.name}{" "}
                          {teacher.subject ? `(${teacher.subject})` : ""}
                        </MenuItem>
                      ))}
                    </Select>
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
                        onChange={(newValue) =>
                          handleTimeChange(index, "startTime", newValue)
                        }
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
                        onChange={(newValue) =>
                          handleTimeChange(index, "endTime", newValue)
                        }
                        disabled={isLoadingClass}
                        sx={{ width: "100%" }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => {
                  const newPeriod = {
                    periodNumber: editTimeTable.periods.length + 1,
                    subject: "",
                    subjectId: "",
                    teacher: "",
                    startTime: "",
                    endTime: "",
                  };
                  setEditTimeTable((prev) => ({
                    ...prev,
                    periods: [...prev.periods, newPeriod],
                  }));
                }}
                disabled={
                  editTimeTable.periods.length >= 8 ||
                  !editTimeTable.classId ||
                  isLoadingClass ||
                  isSubmitting
                }
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
              >
                {isSubmitting ? "Updating..." : "Update Timetable"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
