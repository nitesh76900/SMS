import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Grid, Paper, Avatar } from '@mui/material';
import { useToast } from "../context/ToastContext";


const Profile = () => {
  const showToast = useToast();

  // Dummy profile data (replace with actual API calls)
  const dummyProfile = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    role: 'Admin',
    phone: '123-456-7890',
    address: '123 Main St, Springfield, IL',
  };

  const [profileData, setProfileData] = useState(dummyProfile);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newData, setNewData] = useState(dummyProfile);
  const [error, setError] = useState('');

  // Simulating loading state
  useEffect(() => {
    setLoading(false); // Set loading to false after dummy data is "loaded"
  }, []);

  const handleEditToggle = () => {
    setEditing((prev) => !prev);
    if (!editing) {
      showToast("Editing profile", "info");
    }
  };

  const handleInputChange = (e) => {
    setNewData({
      ...newData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = () => {
    try {
      // In a real scenario, you would call an API to save changes here
      setProfileData(newData);
      setEditing(false);
      setError('');
      showToast("Profile updated successfully", "success");
    } catch (error) {
      showToast("Failed to update profile", "error");
      setError('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setNewData(profileData);
    setEditing(false);
    showToast("Edit cancelled", "info");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
      <Paper className="w-full max-w-md p-5 shadow-lg bg-white rounded-lg">

        {loading ? (
          <Typography variant="h6" align="center">
            Loading...
          </Typography>
        ) : (
          <div>
            {error && (
              <Typography variant="body2" color="error" align="center">
                {error}
              </Typography>
            )}
            <Typography variant="h5" align="center" gutterBottom>
                Profile
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={editing ? newData.name : profileData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editing ? newData.email : profileData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editing ? newData.phone : profileData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editing ? newData.address : profileData.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role"
                  name="role"
                  value={editing ? newData.role : profileData.role}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Grid>
            </Grid>

            {editing ? (
              <div className="flex justify-end mt-4">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                  className="mr-2"
                >
                  Save Changes
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex justify-end mt-4">
                <Button variant="contained" color="primary" onClick={handleEditToggle}>
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        )}
      </Paper>
    </div>
  );
};

export default Profile;
