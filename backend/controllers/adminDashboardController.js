const DashboardStats = require("../models/adminDashboardModel");
const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModels");
const Staff = require("../models/staffModels");
const Receipt = require("../models/receiptModel");
const Parent = require("../models/parentModels");
const StudentAttendance = require("../models/studentAttendanceModel");
const TeacherAttendance = require("../models/teacherAttendanceModel");
const LiveSession = require("../models/LiveSession");
const Connection = require("../models/connectionModels");
const mongoose = require("mongoose");

const dashboardController = {
  // Previous functions remain the same
  async updateDashboardStats(req, res) {
    try {
      console.log("update func called");
      const studentStats = await calculateStudentStats();
      const staffStats = await calculateStaffStats();
      const financialStats = await calculateFinancialStats();
      const communicationStats = await calculateCommunicationStats();
      const attendanceStats = await calculateAttendanceStats();
      const liveSessionStats = await calculateLiveSessionStats();
      const connectionStats = await calculateConnectionStats();

      console.log({
        studentStats,
        staffStats,
        financialStats,
        communicationStats,
        attendanceStats,
        liveSessionStats,
        connectionStats,
        lastUpdated: new Date(),
        dataRange: {
          startDate: new Date(new Date().setDate(1)),
          endDate: new Date(),
        },
      });

      const dashboardStats = await DashboardStats.findOneAndUpdate(
        {},
        {
          studentStats,
          staffStats,
          financialStats,
          communicationStats,
          attendanceStats,
          liveSessionStats,
          connectionStats,
          lastUpdated: new Date(),
          dataRange: {
            startDate: new Date(new Date().setDate(1)),
            endDate: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      res.status(200).json({
        success: true,
        data: dashboardStats,
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({
        success: false,
        message: "Error updating dashboard statistics",
        error: error.message,
      });
    }
  },

  // Get Dashboard Statistics
  async getDashboardStats(req, res) {
    try {
      console.log("get all states function called");
      const stats = await DashboardStats.findOne()
        .sort({ createdAt: -1 })
        .populate("studentStats.classWiseCount.classId")
        .populate("staffStats.departmentDistribution.departmentId")
        .populate("financialStats.salaryDistribution.department");
      console.log("stats", stats);
      if (!stats) {
        const newDashboard = await createDashbord()
        return res.status(200).json({
          success: true,
          data: newDashboard
        });
      }

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
        console.log(error)
      res.status(500).json({
        success: false,
        message: "Error fetching dashboard statistics",
        error: error.message,
      });
    }
  },
};
// Helper function to calculate student statistics
async function calculateStudentStats() {
  try {
    const totalStudents = await Student.countDocuments();

    // Gender distribution
    const genderDistribution = await Student.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    // Class-wise distribution
    const classWiseCount = await Student.aggregate([
      {
        $group: {
          _id: "$class",
          count: { $sum: 1 },
        },
      },
    ]);

    // New admissions (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month
    const newAdmissionsMonthly = await Student.countDocuments({
      admissionDate: { $gte: currentMonth },
    });

    // New admissions (current year)
    const currentYear = new Date(new Date().getFullYear(), 0, 1);
    const newAdmissionsYearly = await Student.countDocuments({
      admissionDate: { $gte: currentYear },
    });

    // Fee statistics
    const feeStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$feesPaid" },
          totalDue: { $sum: "$feesDue" },
        },
      },
    ]);

    // Monthly fee collection trend (last 6 months)
    const monthlyCollection = await Receipt.aggregate([
      {
        $match: {
          dateTime: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateTime" },
            month: { $month: "$dateTime" },
          },
          amount: { $sum: "$depositFee" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Students with pending fees
    const studentsWithDues = await Student.countDocuments({
      feesDue: { $gt: 0 },
    });

    return {
      totalStudents,
      genderDistribution: {
        male: genderDistribution.find((g) => g._id === "Male")?.count || 0,
        female: genderDistribution.find((g) => g._id === "Female")?.count || 0,
        other: genderDistribution.find((g) => g._id === "Other")?.count || 0,
      },
      classWiseCount: classWiseCount.map((c) => ({
        classId: c._id,
        count: c.count,
      })),
      newAdmissions: {
        monthly: newAdmissionsMonthly,
        yearly: newAdmissionsYearly,
      },
      feeStats: {
        totalCollected: feeStats[0]?.totalCollected || 0,
        totalDue: feeStats[0]?.totalDue || 0,
        monthlyCollection: monthlyCollection.map((m) => ({
          month: new Date(m._id.year, m._id.month - 1),
          amount: m.amount,
        })),
        studentsWithDues,
      },
    };
  } catch (error) {
    console.error("Error calculating student stats:", error);
    throw error;
  }
}

// Helper function to calculate staff statistics
async function calculateStaffStats() {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const totalStaff = await Staff.countDocuments();

    // Department-wise distribution
    const departmentDistribution = await Staff.aggregate([
      {
        $group: {
          _id: "$department",
          staffCount: { $sum: 1 },
        },
      },
    ]);

    // Subject-wise teacher distribution
    const subjectDistribution = await Teacher.aggregate([
      {
        $group: {
          _id: "$subject",
          teacherCount: { $sum: 1 },
        },
      },
    ]);

    // Calculate teacher-student ratio
    const totalStudents = await Student.countDocuments();
    const teacherStudentRatio = totalStudents / (totalTeachers || 1);

    return {
      totalTeachers,
      totalStaff,
      departmentDistribution: departmentDistribution.map((d) => ({
        departmentId: d._id,
        staffCount: d.staffCount,
        teacherCount: 0, // This would need to be calculated based on your specific logic
      })),
      teacherStudentRatio: parseFloat(teacherStudentRatio.toFixed(2)),
      subjectDistribution: subjectDistribution.map((s) => ({
        subject: s._id,
        teacherCount: s.teacherCount,
      })),
    };
  } catch (error) {
    console.error("Error calculating staff stats:", error);
    throw error;
  }
}

// Helper function to calculate financial statistics
async function calculateFinancialStats() {
  try {
    // Calculate total revenue (fees collected)
    const totalRevenue = await Receipt.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$depositFee" },
        },
      },
    ]);

    // Monthly revenue for the last 6 months
    const monthlyRevenue = await Receipt.aggregate([
      {
        $match: {
          dateTime: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateTime" },
            month: { $month: "$dateTime" },
          },
          amount: { $sum: "$depositFee" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Calculate fee collection rate
    const totalFees = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalFee: { $sum: "$totalFee" },
          feesPaid: { $sum: "$feesPaid" },
        },
      },
    ]);

    const feeCollectionRate =
      totalFees.length > 0
        ? (totalFees[0].feesPaid / totalFees[0].totalFee) * 100
        : 0;

    // Calculate outstanding payments
    const outstandingPayments = await Student.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$feesDue" },
        },
      },
    ]);

    // Department-wise salary distribution
    const salaryDistribution = await Staff.aggregate([
      {
        $group: {
          _id: "$department",
          totalSalary: { $sum: { $toDouble: "$salary" } },
        },
      },
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue.map((m) => ({
        month: new Date(m._id.year, m._id.month - 1),
        amount: m.amount,
      })),
      feeCollectionRate: parseFloat(feeCollectionRate.toFixed(2)),
      outstandingPayments: outstandingPayments[0]?.total || 0,
      salaryDistribution: salaryDistribution.map((d) => ({
        department: d._id,
        totalSalary: d.totalSalary,
      })),
    };
  } catch (error) {
    console.error("Error calculating financial stats:", error);
    throw error;
  }
}

// Helper function to calculate communication statistics
async function calculateCommunicationStats() {
  try {
    // Active notices (assuming you have a Notice model)
    const activeNotices = await mongoose.model("Notice").countDocuments({
      // Add your active notice criteria
    });

    // Live sessions statistics (assuming you have a LiveSession model)
    const liveSessions = await mongoose.model("LiveSession").aggregate([
      {
        $group: {
          _id: null,
          active: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          scheduled: {
            $sum: {
              $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Parent engagement statistics
    const totalParents = await Parent.countDocuments();

    // Active parents (parents who have logged in in the last 30 days)
    // This would require a lastLogin field in your Parent model
    const activeParents = await Parent.countDocuments({
      lastLogin: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });

    const engagementRate =
      totalParents > 0 ? (activeParents / totalParents) * 100 : 0;

    return {
      activeNotices,
      liveSessions: {
        active: liveSessions[0]?.active || 0,
        completed: liveSessions[0]?.completed || 0,
        scheduled: liveSessions[0]?.scheduled || 0,
      },
      parentEngagement: {
        totalConnections: totalParents,
        activeParents,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
      },
    };
  } catch (error) {
    console.error("Error calculating communication stats:", error);
    throw error;
  }
}

async function calculateAttendanceStats() {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );

    // Student Attendance Stats
    const studentAttendanceMonthly = await StudentAttendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const studentAttendanceToday = await StudentAttendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Teacher Attendance Stats
    const teacherAttendanceMonthly = await TeacherAttendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const teacherAttendanceToday = await TeacherAttendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate attendance trends (last 7 days)
    const attendanceTrend = await StudentAttendance.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      students: {
        today: {
          present:
            studentAttendanceToday.find((s) => s._id === "present")?.count || 0,
          absent:
            studentAttendanceToday.find((s) => s._id === "absent")?.count || 0,
          pending:
            studentAttendanceToday.find((s) => s._id === "pending")?.count || 0,
        },
        monthly: {
          present:
            studentAttendanceMonthly.find((s) => s._id === "present")?.count ||
            0,
          absent:
            studentAttendanceMonthly.find((s) => s._id === "absent")?.count ||
            0,
          pending:
            studentAttendanceMonthly.find((s) => s._id === "pending")?.count ||
            0,
        },
        trend: attendanceTrend,
      },
      teachers: {
        today: {
          present:
            teacherAttendanceToday.find((t) => t._id === "present")?.count || 0,
          absent:
            teacherAttendanceToday.find((t) => t._id === "absent")?.count || 0,
          pending:
            teacherAttendanceToday.find((t) => t._id === "pending")?.count || 0,
        },
        monthly: {
          present:
            teacherAttendanceMonthly.find((t) => t._id === "present")?.count ||
            0,
          absent:
            teacherAttendanceMonthly.find((t) => t._id === "absent")?.count ||
            0,
          pending:
            teacherAttendanceMonthly.find((t) => t._id === "pending")?.count ||
            0,
        },
      },
    };
  } catch (error) {
    console.error("Error calculating attendance stats:", error);
    throw error;
  }
}

// New helper function to calculate live session statistics
async function calculateLiveSessionStats() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Today's sessions
    const todaySessions = await LiveSession.aggregate([
      {
        $match: {
          startFrom: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Sessions by class
    const sessionsByClass = await LiveSession.aggregate([
      {
        $group: {
          _id: "$class",
          total: { $sum: 1 },
        },
      },
    ]);

    // Average session duration
    const avgDuration = await LiveSession.aggregate([
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$duration" },
        },
      },
    ]);

    // Teacher participation
    const teacherParticipation = await LiveSession.aggregate([
      {
        $group: {
          _id: "$teacher",
          sessionCount: { $sum: 1 },
        },
      },
      {
        $sort: { sessionCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return {
      today: {
        scheduled: todaySessions.find((s) => s._id === "scheduled")?.count || 0,
        ongoing: todaySessions.find((s) => s._id === "ongoing")?.count || 0,
        completed: todaySessions.find((s) => s._id === "completed")?.count || 0,
        cancelled: todaySessions.find((s) => s._id === "cancelled")?.count || 0,
      },
      classDistribution: sessionsByClass,
      averageSessionDuration: avgDuration[0]?.averageDuration || 0,
      topTeachers: teacherParticipation,
    };
  } catch (error) {
    console.error("Error calculating live session stats:", error);
    throw error;
  }
}

// New helper function to calculate connection statistics
async function calculateConnectionStats() {
  try {
    // Total connections by profession
    const professionDistribution = await Connection.aggregate([
      {
        $group: {
          _id: "$profession",
          count: { $sum: 1 },
        },
      },
    ]);

    // New connections (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const newConnectionsMonthly = await Connection.countDocuments({
      createdAt: { $gte: currentMonth },
    });

    // Connection trend (last 6 months)
    const monthlyTrend = await Connection.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    return {
      total: await Connection.countDocuments(),
      professionDistribution: professionDistribution.map((p) => ({
        profession: p._id,
        count: p.count,
      })),
      newConnectionsThisMonth: newConnectionsMonthly,
      monthlyTrend: monthlyTrend.map((m) => ({
        month: new Date(m._id.year, m._id.month - 1),
        count: m.count,
      })),
    };
  } catch (error) {
    console.error("Error calculating connection stats:", error);
    throw error;
  }
}

async function createDashbord (){
    console.log("update func called");
  const studentStats = await calculateStudentStats();
  const staffStats = await calculateStaffStats();
  const financialStats = await calculateFinancialStats();
  const communicationStats = await calculateCommunicationStats();
  const attendanceStats = await calculateAttendanceStats();
  const liveSessionStats = await calculateLiveSessionStats();
  const connectionStats = await calculateConnectionStats();
  const dashboardStats = await DashboardStats.create(
    {
      studentStats,
      staffStats,
      financialStats,
      communicationStats,
      attendanceStats,
      liveSessionStats,
      connectionStats,
      lastUpdated: new Date(),
      dataRange: {
        startDate: new Date(new Date().setDate(1)),
        endDate: new Date(),
      },
    });
    return dashboardStats;

}

module.exports = dashboardController;
