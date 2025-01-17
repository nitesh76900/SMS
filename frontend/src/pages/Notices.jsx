import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Paper,
  Typography,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { PiPencilSimple, PiTrash } from "react-icons/pi";
import {
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../services/noticeService";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";
import { selectUser } from "../store/slices/userSlice";
import { useSelector } from "react-redux";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  });

  const showToast = useToast();
  const user = useSelector(selectUser);

  // Fetch notices on component mount
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await getAllNotices();
      console.log("Notices:", data.data);
      setNotices(data.data);
    } catch (err) {
      setError("Failed to fetch notices");
      showToast("Failed to fetch notices", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = (notice = null) => {
    if (notice) {
      setIsEditing(true);
      setSelectedNotice(notice);
      setFormData({
        title: notice.title,
        description: notice.description,
        date: notice.date,
      });
    } else {
      setIsEditing(false);
      setSelectedNotice(null);
      setFormData({ title: "", description: "", date: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ title: "", description: "", date: "" });
    setError("");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.description || !formData.date) {
        showToast("Please fill in all fields", "error");
        return;
      }

      if (isEditing && selectedNotice) {
        await updateNotice(selectedNotice._id, formData);
        showToast("Notice updated successfully", "success");
      } else {
        await createNotice(formData);
        showToast("Notice created successfully", "success");
      }

      handleClose();
      fetchNotices();
    } catch (err) {
      showToast(err.message || "An error occurred", "error");
    }
  };

  const handleDeleteNotice = async (id) => {
    try {
      await deleteNotice(id);
      showToast("Notice deleted successfully", "success");
      fetchNotices();
    } catch (err) {
      showToast("Failed to delete notice", "error");
    }
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredNotices = notices
    .filter(
      (notice) =>
        notice.title.toLowerCase().includes(searchText.toLowerCase()) ||
        notice.description.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.date) - new Date(b.date);
      } else {
        return new Date(b.date) - new Date(a.date);
      }
    });

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="w-full max-w-6xl rounded-lg overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              School Notices/News
            </h1>
            {(user?.role === "admin" ||
              user?.role === "superAdmin" ||
              user?.role === "teacher") && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleClickOpen()}
                className="transition-transform transform hover:scale-105"
              >
                Add New Notice
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-white rounded-md"
            />
            <TextField
              select
              label="Sort By Date"
              value={sortOrder}
              onChange={handleSortChange}
              variant="outlined"
              className="bg-white rounded-md"
              SelectProps={{ native: true }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </TextField>
          </div>

          <Grid container spacing={4}>
            {filteredNotices.map((notice, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={3}
                  className="group relative p-6 h-full flex flex-col justify-between rounded-xl transition-all duration-300 hover:shadow-xl overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                          Notice
                        </span>
                        <span className="flex items-center">{notice.date}</span>
                      </div>
                      <Typography
                        variant="h6"
                        className="font-semibold text-gray-800 tracking-wide group-hover:text-blue-600 transition-colors duration-200"
                      >
                        {notice.title}
                      </Typography>
                    </div>

                    <Typography
                      variant="body2"
                      className="text-gray-700 leading-relaxed line-clamp-3"
                    >
                      {notice.subject}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 leading-relaxed line-clamp-3"
                    >
                      {notice.description}
                    </Typography>
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                    {(user?.role === "admin" ||
                      user?.role === "superAdmin" ||
                      user?.role === "teacher") && (
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          onClick={() => handleClickOpen(notice)}
                        >
                          <PiPencilSimple className="text-lg" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                          onClick={() => handleDeleteNotice(notice._id)}
                        >
                          <PiTrash className="text-lg" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </div>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? "Edit Notice" : "Add New Notice"}
        </DialogTitle>
        <DialogContent>
          {/* Title */}
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={error && !formData.title}
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            error={error && !formData.description}
          />

          {/* Date */}
          <TextField
            label="Date"
            fullWidth
            margin="normal"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            error={error && !formData.date}
          />

          {/* Subject */}
          <TextField
            label="Subject"
            fullWidth
            margin="normal"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            error={error && !formData.subject}
          />

          {/* Audience (For) */}
          <TextField
            label="For (Audience)"
            fullWidth
            margin="normal"
            value={formData.foruse}
            onChange={(e) => setFormData({ ...formData, for: e.target.value })}
            error={error && !formData.for}
          />

          {/* Error message */}
          {error && (
            <Typography
              color="error"
              variant="caption"
              display="block"
              sx={{ mt: 1 }}
            >
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isEditing ? "Update" : "Add"} Notice
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Notices;
