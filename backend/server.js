const express = require("express");
const app = express();
const cors = require("cors");
const colors = require("colors");
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");

const teacherRouter = require("./routes/teacherRouter");
const studentAttendanceRouter = require("./routes/studentAttendanceRouter");
const teacherAttendanceRouter = require("./routes/teacherAttendanceRouter");
const connectionsRouter = require("./routes/connectionsRouter");
const noticeRouter = require("./routes/noticeRouter");
const parentRouter = require("./routes/parentRouter");
const studentRouter = require("./routes/studentRouter");
const authRouter = require("./routes/authRouter");
const studentMarksRouter = require("./routes/studentMarksRouter");
const adminRouter = require("./routes/adminRouter");
const timeTableRouter = require("./routes/timeTableRouter");
const classRouter = require("./routes/classRouter");
const profileRouter = require("./routes/profileRouter");
const staffRouter = require("./routes/staffRouter");
const staffAttendanceRouter = require("./routes/staffAttendanceRouter");
const liveSessionRouter = require("./routes/liveSessionRoutes");
const testRouter = require("./routes/testRouter");
const submissionRouter = require("./routes/submissionRouter");
const dashboardRoutes = require("./routes/adminDashboardRoutes");
const driverRoutes = require("./routes/driverRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const routeRoutes = require("./routes/routeRoutes");
const vehicleHistoryRoutes = require("./routes/vehicleHistoryRoutes");
const teacherDashboardRoutes = require("./routes/teacherDashboardRoutes");
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");

const path = require("path");

require("dotenv").config();

const URL = process.env.DB_URL;
console.log("process.env.DB_URL", process.env.DB_URL);
const PORT = process.env.PORT || 3000;

// app.use(express.static(path.join(__dirname, "../frontend/dist")));
// Middleware
app.use(express.json());
app.use(cookieParser());
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://sms-1-xqox.onrender.com"],
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teacher-dashboard", teacherDashboardRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);
app.use("/api/student-marks", studentMarksRouter);
app.use("/api/student-attendance", studentAttendanceRouter);
app.use("/api/teacher-attendance", teacherAttendanceRouter);
app.use("/api/connections", connectionsRouter);
app.use("/api/class", classRouter);
app.use("/api/notices", noticeRouter);
app.use("/api/parents", parentRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/students", studentRouter);
app.use("/api/time-table", timeTableRouter);
app.use("/api/profile", profileRouter);
app.use("/api/staff", staffRouter);
app.use("/api/staff-attendance", staffAttendanceRouter);
app.use("/api/live-sessions", liveSessionRouter);
app.use("/api/tests", testRouter);
app.use("/api/submission", submissionRouter);
app.use("/api/driver", driverRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/vehicle-route", routeRoutes);
app.use("/api/vehicle-history", vehicleHistoryRoutes);

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
// });

app.listen(PORT, async () => {
  await connectDB(URL);
  console.log(`Server running on Port- ${PORT}`.bgBlue.black);
});
