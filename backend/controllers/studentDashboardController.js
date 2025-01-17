const Student = require('../models/studentModel');
const StudentAttendance = require('../models/studentAttendanceModel');
const StudentMarks = require('../models/studentMarksModel');
const Class = require('../models/classModels');
const Test = require('../models/TestModel');
const Submission = require('../models/SubmissionModel');

const getStudentDashboardData = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Get student's class information
        const student = await Student.findById(studentId).populate('class');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // 1. Statistics Section
        // Calculate attendance rate
        const currentDate = new Date();
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        
        const attendanceRecords = await StudentAttendance.find({
            student: studentId,
            date: { $gte: startOfYear }
        });

        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        // Calculate average grade
        const studentMarks = await StudentMarks.find({ studentId });
        const averageGrade = studentMarks.reduce((acc, curr) => acc + curr.totalMarks, 0) / 
                           (studentMarks.length || 1);

        // Calculate class rank
        const classmates = await Student.find({ class: student.class });
        const classmateIds = classmates.map(classmate => classmate._id);
        const allClassmateMarks = await StudentMarks.aggregate([
            { $match: { studentId: { $in: classmateIds } } },
            {
                $group: {
                    _id: '$studentId',
                    averageMarks: { $avg: '$totalMarks' }
                }
            },
            { $sort: { averageMarks: -1 } }
        ]);

        const studentRank = allClassmateMarks.findIndex(
            mark => mark._id.toString() === studentId.toString()
        ) + 1;

        // Get class size
        const classSize = await Class.findById(student.class).then(cls => 
            cls.students.length
        );

        // 2. Monthly Attendance Chart
        const fourMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        
        const monthlyAttendance = await StudentAttendance.aggregate([
            {
                $match: {
                    student: studentId,
                    date: { $gte: fourMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                    },
                    totalDays: { $count: {} },
                    presentDays: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "present"] }, 1, 0]
                        }
                    },
                    absentDays: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "absent"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const attendanceData = monthlyAttendance.map(month => ({
            month: monthNames[month._id.month - 1],
            present: ((month.presentDays / month.totalDays) * 100).toFixed(1),
            absent: ((month.absentDays / month.totalDays) * 100).toFixed(1)
        }));

        // 3. Academic Performance Chart
        const submissions = await Submission.aggregate([
            {
                $match: {
                    studentId: studentId,
                    status: 'EVALUATED'
                }
            },
            {
                $lookup: {
                    from: 'tests',
                    localField: 'testId',
                    foreignField: '_id',
                    as: 'test'
                }
            },
            {
                $unwind: '$test'
            },
            {
                $group: {
                    _id: '$test.subject',
                    totalMarks: { $sum: '$totalMarks' },
                    testsCount: { $sum: 1 }
                }
            }
        ]);

        const classAverages = await Submission.aggregate([
            {
                $match: {
                    status: 'EVALUATED'
                }
            },
            {
                $lookup: {
                    from: 'tests',
                    localField: 'testId',
                    foreignField: '_id',
                    as: 'test'
                }
            },
            {
                $unwind: '$test'
            },
            {
                $group: {
                    _id: '$test.subject',
                    averageMarks: { $avg: '$totalMarks' }
                }
            }
        ]);

        const academicData = submissions.map(subject => {
            const avgForSubject = classAverages.find(avg => avg._id === subject._id);
            return {
                subject: subject._id,
                marks: (subject.totalMarks / subject.testsCount).toFixed(1),
                average: avgForSubject ? avgForSubject.averageMarks.toFixed(1) : 0
            };
        });

        // 4. Submission Status Data
        const submissionStatus = await Submission.aggregate([
            {
                $match: {
                    studentId: studentId,
                }
            },
            {
                $group: {
                    _id: null,
                    submitted: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["SUBMITTED", "EVALUATED"]] },
                                1,
                                0
                            ]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["IN_PROGRESS", "TIMED_OUT"]] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const submissionData = submissionStatus.length > 0 ? {
            submitted: submissionStatus[0].submitted,
            pending: submissionStatus[0].pending
        } : {
            submitted: 0,
            pending: 0
        };

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    attendanceRate: {
                        current: Math.round(attendanceRate),
                        percentageChange: 2.5
                    },
                    averageGrade: {
                        current: Math.round(averageGrade),
                        percentageChange: -1.2
                    },
                    classRank: {
                        current: studentRank,
                        percentageChange: 3
                    },
                    classSize: {
                        current: classSize,
                        percentageChange: 0
                    }
                },
                monthlyAttendance: attendanceData,
                academicPerformance: academicData,
                submissionStatus: submissionData
            }
        });

    } catch (error) {
        console.error('Error in getStudentDashboardData:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching student dashboard data',
            error: error.message
        });
    }
};

module.exports = {
    getStudentDashboardData
};