import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ProfileService from "../../services/profileService";

const initialState = {
  user: null, // Single state object to store user data
  isAuthenticated: false,
  status: "idle", // For async operation status
  error: null, // For error handling
};

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      // console.log('Fetching user data...');
      const userData = await ProfileService.getProfile();
      console.log('------User data fetched successfully-------:', userData);
      return userData.user; // Return the fetched user data
    } catch (error) {
      console.error(
        "Error fetching user data:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || error.message); // Properly handle errors
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // console.log('===========Setting user:============', action.payload);
      state.user = action.payload; // Set all user data in a single state
      state.isAuthenticated = true;
      // console.log('User set successfully:', action.payload);
    },
    clearUser: (state) => {
      state.user = null; // Clear user data
      state.isAuthenticated = false;
      // console.log('User cleared successfully.');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
        // console.log('Fetching user data... Status: loading');
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload; // Store user data in a single state
        state.isAuthenticated = true;
        // console.log('User data set successfully in state:', state.user);
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        console.error("Error setting user data in state:", action.payload);
      });
  },
});

// Export actions and selectors
export const { setUser, clearUser } = userSlice.actions;
export const selectUser = (state) => {
  console.log("select user called",state.user)
  return state.user.user;
};
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

export default userSlice.reducer;
