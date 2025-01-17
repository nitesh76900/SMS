import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentService from "../services/studentServices";
import { getClassById } from "../services/classService";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import ReceiptModal from "../modals/ReceiptModal";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";

const StudentFeeManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const navigate = useNavigate();
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await StudentService.getAllStudents();
        const studentsWithClassDetails = await Promise.all(
          response.data.map(async (student) => {
            try {
              const classDetails = await getClassById(student.class);
              return {
                ...student,
                classDetails: classDetails.data,
              };
            } catch (err) {
              console.error("Error fetching class details:", err);
              showToast(
                `Failed to fetch class details for ${student.name}`,
                "error"
              );
              return {
                ...student,
                classDetails: { name: "N/A", section: "N/A" },
              };
            }
          })
        );
        setStudents(studentsWithClassDetails);
        showToast(
          `Loaded ${studentsWithClassDetails.length} students`,
          "success"
        );

        const classes = new Set(
          studentsWithClassDetails.map(
            (student) =>
              `${student.classDetails.name}-${student.classDetails.section}`
          )
        );
        setUniqueClasses(Array.from(classes).sort());
      } catch (err) {
        showToast("Failed to fetch students", "error");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [showToast]);

  const handleSendReminder = async (student, type) => {
    try {
      if (type === "email") {
        await StudentService.sendFeeReminderEmail(student._id);
        showToast(`Reminder email sent to ${student.name}`, "success");
      } else if (type === "whatsapp") {
        showToast(`WhatsApp reminder sent to ${student.name}`, "success");
      }
    } catch (err) {
      showToast(`Failed to send ${type} reminder to ${student.name}`, "error");
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    showToast(
      `Filtered by ${
        event.target.value === "all"
          ? "all classes"
          : `class ${event.target.value}`
      }`,
      "info"
    );
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.classDetails?.name + " " + student.classDetails?.section)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClass === "all" ||
      `${student.classDetails.name}-${student.classDetails.section}` ===
        selectedClass;

    return matchesSearch && matchesClass;
  });

  const getFeeStatus = (feesPaid, totalFee) => {
    const percentage = (feesPaid / totalFee) * 100;
    if (percentage === 100) return { color: "success", text: "Paid" };
    if (percentage >= 75) return { color: "info", text: "Mostly Paid" };
    if (percentage >= 50) return { color: "warning", text: "Partially Paid" };
    return { color: "error", text: "Pending" };
  };

  const handleViewReceipt = (student) => {
    if (!student.lastPayment) {
      showToast("No payment receipt available", "info");
      return;
    }
    setShowReceipt(true);
    setReceiptId(student.lastPayment);
    showToast("Loading payment receipt", "info");
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Box className="p-6">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <Box className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Box className="flex justify-between items-center mb-6">
          <div>
            <Typography variant="h4" className="font-bold">
              Student Fee Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Total Students: {filteredStudents.length}
            </Typography>
          </div>
          <Button
            variant="contained"
            onClick={() => navigate("/add-student-fee")}
            className="bg-blue-600"
          >
            Add Fee Payment
          </Button>
        </Box>

        {/* Search and Filter Bar */}
        <Box className="flex gap-4 mb-4">
          <TextField
            className="flex-grow"
            variant="outlined"
            placeholder="Search by name, registration number, email, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
            }}
          />
          <FormControl className="min-w-[200px]">
            <InputLabel id="class-filter-label">Class Filter</InputLabel>
            <Select
              labelId="class-filter-label"
              value={selectedClass}
              label="Class Filter"
              onChange={handleClassChange}
            >
              <MenuItem value="all">All Classes</MenuItem>
              {uniqueClasses.map((className) => (
                <MenuItem key={className} value={className}>
                  Class {className}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Students Table */}
        <TableContainer component={Paper} className="shadow-md">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell>Registration No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class - Section</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Total Fee</TableCell>
                <TableCell align="right">Fees Paid</TableCell>
                <TableCell align="right">Fees Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => {
                const status = getFeeStatus(student.feesPaid, student.totalFee);
                return (
                  <TableRow key={student._id} hover>
                    <TableCell>{student.registrationNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {student.classDetails?.name} -{" "}
                        {student.classDetails?.section}
                      </Typography>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell align="right">
                      ₹{student.totalFee?.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ₹{student.feesPaid?.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ₹{student.feesDue?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Alert severity={status.color} className="py-0">
                        {status.text}
                      </Alert>
                    </TableCell>
                    <TableCell>
                      <Box className="flex justify-center gap-2">
                        {student && (
                          <Tooltip title="View Receipt">
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => handleViewReceipt(student)}
                                disabled={!student.lastPayment}
                              >
                                <ReceiptIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {student.feesDue > 0 && (
                          <>
                            <Tooltip title="Send Email Reminder">
                              <span>
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleSendReminder(student, "email")
                                  }
                                  disabled={!student.feesDue}
                                >
                                  <EmailIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Send WhatsApp Reminder">
                              <span>
                                <IconButton
                                  color="success"
                                  onClick={() =>
                                    handleSendReminder(student, "whatsapp")
                                  }
                                  disabled={!student.remindByWhatsapp}
                                >
                                  <WhatsAppIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert severity={notification.type} onClose={handleCloseNotification}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
      {showReceipt && (
        <ReceiptModal
          receiptId={receiptId}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
};

export default StudentFeeManagementPage;
