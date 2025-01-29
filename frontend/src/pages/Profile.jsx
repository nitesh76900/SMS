import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import ProfileService from "../services/profileService";
import UpdatePassword from "../forms/UpdatePassword";

const Profile = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await ProfileService.getProfile();
      console.log("response", response);
      if (response.user) {
        setProfileData(response.user);
      }
    } catch (err) {
      setError("Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Early return if no profile data
  if (!profileData) {
    return (
      <Box minHeight="100vh" bgcolor="#f5f5f5" p={2}>
        <Card sx={{ maxWidth: 800, margin: "0 auto" }}>
          <CardContent>
            <Alert severity="error">No profile data available</Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Determine if user is staff/admin or student
  const isStaff = !!profileData.staffId;
  const displayData = isStaff ? profileData.staffId : profileData;

  const InfoField = ({ label, value }) => (
    <Box mb={2}>
      <Typography variant="subtitle2" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body2">{value || "N/A"}</Typography>
    </Box>
  );

  return (
    <Box
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={2}
      sx={{ py: { sm: 3, lg: 4 } }}
    >
      <Card sx={{ maxWidth: 800, margin: "0 auto" }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 3 }}
          >
            Profile Details
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Common Fields */}
            <Grid item xs={12} sm={6}>
              <InfoField label="Name" value={displayData.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoField label="Email" value={displayData.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoField label="Phone Number" value={displayData.phoneNo} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoField label="Address" value={displayData.address} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoField
                label="Registration Number"
                value={profileData.registrationNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoField label="Role" value={profileData.role} />
            </Grid>

            {/* Staff/Admin Specific Fields */}
            {isStaff && (
              <>
                <Grid item xs={12} sm={6}>
                  <InfoField
                    label="Department"
                    value={displayData.departmentName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoField label="Position" value={displayData.position} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoField
                    label="Join Date"
                    value={
                      displayData.joinDate
                        ? new Date(displayData.joinDate).toLocaleDateString()
                        : null
                    }
                  />
                </Grid>
              </>
            )}

            {/* Student Specific Fields */}
            {!isStaff && (
              <>
                <Grid item xs={12} sm={6}>
                  <InfoField label="Batch" value={displayData.batch} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoField
                    label="Class"
                    value={`${displayData.className} - ${displayData.classSec}`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoField
                    label="Admission Date"
                    value={
                      displayData.admissionDate
                        ? new Date(
                            displayData.admissionDate
                          ).toLocaleDateString()
                        : null
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Fee Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">
                        Total Fee
                      </Typography>
                      <Typography variant="body2">
                        ₹{displayData.totalFee || "0"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">
                        Fees Paid
                      </Typography>
                      <Typography variant="body2">
                        ₹{displayData.feesPaid || "0"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">
                        Fees Due
                      </Typography>
                      <Typography variant="body2">
                        ₹{displayData.feesDue || "0"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsPasswordDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Update Password
            </Button>
          </Box>
        </CardContent>
      </Card>

      <UpdatePassword
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      />
    </Box>
  );
};

export default Profile;
