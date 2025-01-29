import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
} from "@mui/material";
import ProfileService from "../services/profileService";

const UpdatePasswordDialog = ({ open, onClose }) => {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError("");
  };

  const validatePasswords = () => {
    if (
      !passwords.oldPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setError("All fields are required");
      return false;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }
    if (passwords.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      await ProfileService.changePassword(
        passwords.oldPassword,
        passwords.newPassword
      );
      onClose();
      // Reset form
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password Updated");
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Update Password</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              type="password"
              label="Current Password"
              value={passwords.oldPassword}
              onChange={handleChange("oldPassword")}
              fullWidth
              autoComplete="current-password"
              size="small"
            />
            <TextField
              type="password"
              label="New Password"
              value={passwords.newPassword}
              onChange={handleChange("newPassword")}
              fullWidth
              autoComplete="new-password"
              size="small"
            />
            <TextField
              type="password"
              label="Confirm New Password"
              value={passwords.confirmPassword}
              onChange={handleChange("confirmPassword")}
              fullWidth
              autoComplete="new-password"
              size="small"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdatePasswordDialog;
