import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getAllClasses } from "../../services/classService"; // Adjust the import path as needed
import { useToast } from "../../context/ToastContext";

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const fetchedClasses = await getAllClasses();
        console.log("fetchedClasses.data", fetchedClasses.data);
        setClasses(fetchedClasses.data);
        if (fetchedClasses.data.length === 0) {
          showToast("No classes found in the system", "info");
        } else {
          showToast(
            `Successfully loaded ${fetchedClasses.data.length} classes`,
            "success"
          );
        }
      } catch (err) {
        setError("Failed to fetch classes");
        showToast("Failed to load classes", "error");
        console.error("Error fetching classes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [showToast]);

  const handleViewStudents = (classItem) => {
    if (classItem.students.length === 0) {
      showToast(`No students enrolled in ${classItem.name}`, "info");
    } else {
      showToast(`Viewing students in ${classItem.name}`, "info");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="m-4">
        {error}
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper} className="my-4">
      {classes.length === 0 ? (
        <Alert severity="info" className="m-4">
          No classes found
        </Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class-Section</TableCell>
              <TableCell>Total Students</TableCell>
              <TableCell>View Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classItem, index) => (
              <TableRow key={index}>
                <TableCell>
                  {classItem.name} - {classItem.section}
                </TableCell>
                <TableCell>{classItem.students.length}</TableCell>
                <TableCell>
                  <Link
                    to={`/attendance/${classItem._id}`}
                    onClick={() => handleViewStudents(classItem)}
                  >
                    <Button variant="contained">View Students</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default ClassList;
