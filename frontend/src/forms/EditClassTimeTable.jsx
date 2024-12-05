import React, { useEffect, useState } from "react";
import {
  Grid,
  Select,
  MenuItem,
  Typography,
  TextField
  ,Button
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { getAllClasses, getClassById } from "../services/classService";
import TimeTableService from "../services/timeTableServices";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const EditClassTimeTable = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [editTimeTable, setEditTimeTable] = useState({
    classId: "", // Ensure this is an empty string initially
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
    return dayjs(time12h, 'hh:mm A').format('HH:mm');
  };

  // Fetch existing timetable data and classes on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
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
            subjectId: period.subject, // Assuming subject is a string
            teacher: period.teacher._id, // Assuming teacher is an object with _id
            startTime: convertTo24HourFormat(period.startTime),
            endTime: convertTo24HourFormat(period.endTime),
          })),
        });

        // Fetch class details to get subjects
        const classData = await getClassById(timetableResponse.class._id);
        setClassSubjects(classData.data.subjects || []);
      } catch (error) {
        showToast(`Error fetching timetable: ${error.message}`, "error");
      }
    };

    fetchInitialData();
  }, [id, showToast]);

  const handleClassSelection = async (classId) => {
    try {
      // Ensure classId is a string and not undefined
      if (!classId) return;

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
    }
  };

  const handleSubjectSelection = (periodIndex, subject) => {
    // Ensure subject exists before accessing its properties
    if (!subject) return;

    const newPeriods = [...editTimeTable.periods];
    newPeriods[periodIndex] = {
      ...newPeriods[periodIndex],
      subject: subject.subjectName,
      subjectId: subject._id,
      teacher: subject.teacher?._id || "", // Use optional chaining
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
    console.log('editTimeTable', editTimeTable)
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
      // Prepare the payload to match the expected backend structure
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

      // Navigate back to previous page or timetable list
      navigate(-1);
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    }
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Select Class</Typography>
        <Select
          fullWidth
          value={editTimeTable.classId || ""} // Ensure a valid value
          onChange={(e) => handleClassSelection(e.target.value)}
        >
          {classes.map((cls) => (
            <MenuItem key={cls._id} value={cls._id}>
              {cls.name} - {cls.section}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1">Select Day</Typography>
        <Select
          fullWidth
          value={editTimeTable.day || ""} // Ensure a valid value
          onChange={(e) =>
            setEditTimeTable((prev) => ({
              ...prev,
              day: e.target.value,
            }))
          }
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

      {editTimeTable.periods.map((period, index) => (
        <Grid item xs={12} key={index}>
          <Typography variant="h6">Period {index + 1}</Typography>
          <Typography variant="subtitle1">Select Subject</Typography>
          <Select
            fullWidth
            value={period.subjectId || ""} // Ensure a valid value
            onChange={(e) => {
              const selectedSubject = classSubjects.find(
                (subject) => subject._id === e.target.value
              );
              handleSubjectSelection(index, selectedSubject);
            }}
            displayEmpty
          >
            {classSubjects.map((subject) => (
              <MenuItem key={subject._id} value={subject._id}>
                {subject.subjectName}
              </MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            label="Teacher"
            value={period.teacher}
            disabled
            sx={{ mt: 1 }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Start Time"
              value={period.startTime ? dayjs(`2024-01-01 ${period.startTime}`) : null}
              onChange={(newValue) => {
                const formattedTime = newValue ? newValue.format('hh:mm A') : '';
                const newPeriods = [...editTimeTable.periods];
                newPeriods[index] = {
                  ...newPeriods[index],
                  startTime: formattedTime
                };
                setEditTimeTable((prev) => ({
                  ...prev,
                  periods: newPeriods,
                }));
              }}
              sx={{ mt: 1, width: '100%' }}
            />
            <TimePicker
              label="End Time"
              value={period.endTime ? dayjs(`2024-01-01 ${period.endTime}`) : null}
              onChange={(newValue) => {
                const formattedTime = newValue ? newValue.format('hh:mm A') : '';
                const newPeriods = [...editTimeTable.periods];
                newPeriods[index] = {
                  ...newPeriods[index],
                  endTime: formattedTime
                };
                setEditTimeTable((prev) => ({
                  ...prev,
                  periods: newPeriods,
                }));
              }}
              sx={{ mt: 1, width: '100%' }}
            />
          </LocalizationProvider>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={addPeriod}
          disabled={!editTimeTable.classId}
        >
          Add Period
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateTimeTable}
          disabled={!editTimeTable.classId}
        >
          Update Timetable
        </Button>
      </Grid>
    </Grid>
  );
};

export default EditClassTimeTable;
