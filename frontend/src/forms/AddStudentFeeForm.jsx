import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import StudentService from "../services/studentServices";
import { getAllClasses } from "../services/classService";
import { useToast } from "../context/ToastContext";

const AddStudentFeeForm = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    depositFee: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const showToast = useToast();

  // Fetch all classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch students when a class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await getAllClasses();
      console.log("Classes", response.data);
      setClasses(response.data || []);
      if (response.data.length === 0) {
        showToast("No classes found in the system", "info");
      }
    } catch (err) {
      showToast("Failed to fetch classes", "error");
      setError("Failed to fetch classes. Please try again.");
    }
  };

  const fetchStudentsByClass = async (classId) => {
    try {
      const response = await StudentService.getStudentByClass(classId);
      console.log("response", response.data.student);
      setStudents(response.data.student || []);
      if (response.data.student.length === 0) {
        showToast("No students found in this class", "info");
      }
    } catch (err) {
      showToast("Failed to fetch students", "error");
      setError("Failed to fetch students. Please try again.");
    }
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    showToast(`Selected class: ${classes.find(c => c._id === e.target.value)?.name}`, "info");
    setFormData((prev) => ({
      ...prev,
      studentId: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        studentId: formData.studentId,
        depositFee: Number(formData.depositFee),
        description: formData.description,
      };

      await StudentService.addFeePayment(paymentData);
      showToast("Fee payment added successfully", "success");
      
      // Clear form
      setFormData({
        studentId: "",
        depositFee: "",
        description: "",
      });
      setSelectedClass("");

      // Navigate back after delay
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      showToast(err.message || "Failed to add fee payment", "error");
      setError(err.message || "Failed to add fee payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box className="p-6 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardContent>
          <Typography
            variant="h5"
            className="mb-6 text-center font-semibold text-gray-800"
          >
            Add Student Fee Payment
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Class Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={handleClassChange}
                    disabled={loading}
                    label="Select Class"
                  >
                    {classes.map((classItem) => (
                      <MenuItem key={classItem._id} value={classItem._id}>
                        {classItem.name}({classItem.section})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Student Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Student</InputLabel>
                  <Select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    disabled={loading || !selectedClass}
                    label="Select Student"
                  >
                    {students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>
                        {student.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Fee Amount */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Deposit Fee Amount"
                  type="number"
                  name="depositFee"
                  value={formData.depositFee}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                  disabled={loading}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                  disabled={loading}
                  placeholder="Enter payment details..."
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box className="flex justify-between gap-4">
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !formData.studentId}
                    className="bg-blue-600"
                  >
                    {loading ? "Submitting..." : "Submit Payment"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddStudentFeeForm;
