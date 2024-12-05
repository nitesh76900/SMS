import React, { useState } from "react";
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
  TextField,
  Grid,
  Alert,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import { studentMarksService } from "../services/studentMarksServices"; // Adjust the import path as needed
import { useToast } from "../context/ToastContext";

const StudentResultPage = () => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [dob, setDOB] = useState("");
  const [studentResult, setStudentResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = useToast();

  const handleSearch = async () => {
    if (!registrationNumber || !dob) {
      setError("Please enter both Registration Number and Date of Birth");
      showToast("Please enter both Registration Number and Date of Birth", "error");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await studentMarksService.getStudentMarksByRegistration(
        registrationNumber,
        dob
      );
      const calculatedResult = studentMarksService.calculateStudentResult(result.marks);
      setStudentResult({
        ...result,
        ...calculatedResult,
      });
      showToast("Student result found successfully", "success");
    } catch (err) {
      setError(err.message || "Failed to fetch student results");
      showToast(err.message || "Failed to fetch student results", "error");
      setStudentResult(null);
    } finally {
      setLoading(false);
    }
  };

  const componentRef = React.useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Box className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Student Result
      </h1>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Grid
        container
        spacing={3}
        justifyContent="center"
        direction="column"
        alignItems="center"
      >
        <Grid item className="w-96">
          <TextField
            label="Registration Number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            fullWidth
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} className="w-96">
          <TextField
            label="Date of Birth"
            type="date"
            value={dob}
            onChange={(e) => setDOB(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            className="bg-blue-600"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search Result"}
          </Button>
        </Grid>
      </Grid>

      {studentResult && (
        <Box ref={componentRef}>
          {/* <Typography variant="h4" className="mt-8 font-bold">
            {studentResult.studentId.name}Students's Result
          </Typography> */}
          <TableContainer component={Paper} className="mt-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell align="right">Marks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentResult.marks.map((subject, index) => (
                  <TableRow key={index}>
                    <TableCell>{subject.subject}</TableCell>
                    <TableCell align="right">{subject.mark}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>Total Marks</TableCell>
                  <TableCell align="right">
                    {studentResult.totalMarks}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Percentage</TableCell>
                  <TableCell align="right">
                    {studentResult.percentage}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Result</TableCell>
                  <TableCell align="right">
                    <span
                      className={`px-2 py-1 rounded ${
                        studentResult.result === "Pass"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {studentResult.result}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box className="mt-4 flex justify-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrint}
              className="bg-blue-600"
            >
              Print
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StudentResultPage;
