const mongoose = require("mongoose");

const dashboardStatsSchema = new mongoose.Schema(
  {
    // Student Statistics
    studentStats: {
      totalStudents: Number,
      genderDistribution: {
        male: Number,
        female: Number,
        other: Number,
      },
      classWiseCount: [
        {
          classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
          count: Number,
        },
      ],
      newAdmissions: {
        monthly: Number,
        yearly: Number,
      },
      feeStats: {
        totalCollected: Number,
        totalDue: Number,
        monthlyCollection: [
          {
            month: Date,
            amount: Number,
          },
        ],
        studentsWithDues: Number,
      },
    },

    // Teacher & Staff Statistics
    staffStats: {
      totalTeachers: Number,
      totalStaff: Number,
      departmentDistribution: [
        {
          departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
          },
          staffCount: Number,
          teacherCount: Number,
        },
      ],
      teacherStudentRatio: Number,
      subjectDistribution: [
        {
          subject: String,
          teacherCount: Number,
        },
      ],
    },

    // Academic Statistics
    academicStats: {
      totalClasses: Number,
      classPerformance: [
        {
          classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
          averageScore: Number,
          assessmentCompletion: Number,
        },
      ],
      overallPerformance: {
        averageScore: Number,
        assessmentCompletionRate: Number,
      },
    },

    // Financial Statistics
    financialStats: {
      totalRevenue: Number,
      monthlyRevenue: [
        {
          month: Date,
          amount: Number,
        },
      ],
      feeCollectionRate: Number,
      outstandingPayments: Number,
      salaryDistribution: [
        {
          department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
          },
          totalSalary: Number,
        },
      ],
    },

    // Communication Statistics
    communicationStats: {
      activeNotices: Number,
      liveSessions: {
        active: Number,
        completed: Number,
        scheduled: Number,
      },
      parentEngagement: {
        totalConnections: Number,
        activeParents: Number,
        engagementRate: Number,
      },
    },

    // Metadata
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    dataRange: {
      startDate: Date,
      endDate: Date,
    },
    attendanceStats: {
      students: { type: Object },
      teachers: { type: Object },
    },
    liveSessionStats: { type: Object },
    connectionStats: { type: Object },
  },
  { timestamps: true }
);

const DashboardStats = mongoose.model("DashboardStats", dashboardStatsSchema);
module.exports = DashboardStats;
