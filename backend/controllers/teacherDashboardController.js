const Teacher = require('../models/teacherModels');
const Class = require('../models/classModels');
const Student = require('../models/studentModel');
const StudentAttendance = require('../models/staffAttendanceModels');
const StudentMarks = require('../models/studentMarksModel');
const TimeTable = require('../models/timeTableModels');


const getDashboardStats = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const [basicStats, attendanceTrends, classPerformance, upcomingSchedule] = await Promise.all([
            getBasicStats(teacherId),
            getAttendanceTrends(teacherId),
            getClassPerformance(teacherId),
            getUpcomingSchedule(teacherId)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                ...basicStats,
                attendanceTrends,
                classPerformance,
                upcomingSchedule
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

const getBasicStats = async (teacherId) => {
    // Get teacher details with populated classes
    const teacher = await Teacher.findById(teacherId)
        .populate('leadClass')
        .populate('assignedClass');

    if (!teacher) {
        throw new Error('Teacher not found');
    }

    const classesToAnalyze = teacher.leadClass 
        ? [teacher.leadClass._id] 
        : teacher.assignedClass.map(c => c._id);

    const classes = await Class.find({
        _id: { $in: classesToAnalyze }
    }).populate('students');

    const currentStats = await calculateMonthStats(classes, teacherId);
    const lastMonthStats = await calculateLastMonthStats(classes, teacherId);

    return {
        totalStudents: {
            value: currentStats.totalStudents,
            change: calculateChange(currentStats.totalStudents, lastMonthStats.totalStudents)
        },
        averageAttendance: {
            value: currentStats.averageAttendance,
            change: calculateChange(currentStats.averageAttendance, lastMonthStats.averageAttendance)
        },
        classesToday: {
            value: currentStats.classesToday,
            change: calculateChange(currentStats.classesToday, lastMonthStats.classesToday)
        },
        teachingHours: {
            value: `${currentStats.teachingHours}h`,
            change: calculateChange(currentStats.teachingHours, lastMonthStats.teachingHours)
        }
    };
};

const getAttendanceTrends = async (teacherId) => {
    const teacher = await Teacher.findById(teacherId)
        .populate('leadClass')
        .populate('assignedClass');

    const classesToAnalyze = teacher.leadClass 
        ? [teacher.leadClass._id] 
        : teacher.assignedClass.map(c => c._id);

    const classes = await Class.find({
        _id: { $in: classesToAnalyze }
    }).populate('students');

    const studentIds = classes.flatMap(cls => cls.students.map(student => student._id));

    // Get last 5 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const attendanceTrends = [];

    for (const month of months) {
        const startDate = new Date(2024, months.indexOf(month), 1);
        const endDate = new Date(2024, months.indexOf(month) + 1, 0);

        const monthAttendance = await StudentAttendance.find({
            student: { $in: studentIds },
            date: { $gte: startDate, $lte: endDate }
        });

        const totalRecords = monthAttendance.length;
        const presentRecords = monthAttendance.filter(record => record.status === 'present').length;
        const absentRecords = monthAttendance.filter(record => record.status === 'absent').length;

        attendanceTrends.push({
            month,
            attendance: totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0,
            absent: totalRecords > 0 ? (absentRecords / totalRecords) * 100 : 0
        });
    }

    return attendanceTrends;
};

// New function to get class performance
const getClassPerformance = async (teacherId) => {
    const teacher = await Teacher.findById(teacherId)
        .populate('leadClass')
        .populate('assignedClass');

    const classesToAnalyze = teacher.leadClass 
        ? [teacher.leadClass._id] 
        : teacher.assignedClass.map(c => c._id);

    const classes = await Class.find({
        _id: { $in: classesToAnalyze }
    });

    const studentIds = classes.flatMap(cls => cls.students);

    const marks = await StudentMarks.find({
        studentId: { $in: studentIds }
    });

    // Group marks by subject and calculate averages
    const subjectPerformance = {};
    marks.forEach(mark => {
        mark.marks.forEach(subjectMark => {
            if (!subjectPerformance[subjectMark.subject]) {
                subjectPerformance[subjectMark.subject] = [];
            }
            subjectPerformance[subjectMark.subject].push(subjectMark.mark);
        });
    });

    // Calculate average for each subject
    const performance = Object.entries(subjectPerformance).map(([subject, marks]) => ({
        subject,
        average: marks.length > 0 
            ? marks.reduce((sum, mark) => sum + mark, 0) / marks.length
            : 0
    }));

    return performance;
};

const getUpcomingSchedule = async (teacherId) => {
    // Get current day and time
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    
    // Get all timetables where this teacher has classes
    const timetables = await TimeTable.find({
        'periods.teacher': teacherId,
        day: currentDay
    }).populate('class');

    if (!timetables.length) {
        return [];
    }

    // Get current time in HH:MM AM/PM format
    const currentTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // Convert time to minutes for comparison
    const convertTimeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const isPM = period === 'PM';
        return (isPM ? (hours % 12) + 12 : hours % 12) * 60 + minutes;
    };

    const currentTimeInMinutes = convertTimeToMinutes(currentTime);

    // Collect all periods for today and sort by start time
    let allPeriods = [];
    timetables.forEach(timetable => {
        timetable.periods.forEach(period => {
            const startTimeInMinutes = convertTimeToMinutes(period.startTime);
            if (startTimeInMinutes > currentTimeInMinutes) {
                allPeriods.push({
                    subject: period.subject,
                    startTime: period.startTime,
                    className: `Class ${timetable.class.name}`,
                    periodNumber: period.periodNumber
                });
            }
        });
    });

    // Sort periods by start time
    allPeriods.sort((a, b) => {
        return convertTimeToMinutes(a.startTime) - convertTimeToMinutes(b.startTime);
    });

    // Format schedule entries
    const upcomingSchedule = allPeriods.slice(0, 4).map(period => ({
        subject: period.subject,
        class: period.className,
        time: period.startTime
    }));

    // Add staff meeting if there's space and it's after current time
    const staffMeetingTime = "02:00 PM";
    if (upcomingSchedule.length < 4 && 
        convertTimeToMinutes(staffMeetingTime) > currentTimeInMinutes) {
        upcomingSchedule.push({
            subject: "Staff Meeting",
            class: "Class Room 101",
            time: staffMeetingTime
        });
    }

    return upcomingSchedule;
};

const calculateMonthStats = async (classes, teacherId) => {
    // Get unique students
    const uniqueStudentIds = new Set();
    classes.forEach(cls => {
        cls.students.forEach(student => {
            uniqueStudentIds.add(student._id.toString());
        });
    });
    const totalStudents = uniqueStudentIds.size;

    // Calculate today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceRecords = await StudentAttendance.find({
        student: { $in: Array.from(uniqueStudentIds) },
        date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
    });

    const presentCount = attendanceRecords.filter(record => 
        record.status === 'present'
    ).length;

    const averageAttendance = totalStudents > 0 
        ? Math.round((presentCount / totalStudents) * 100) 
        : 0;

    // Calculate teaching hours
    let teachingHours = 0;
    for (const cls of classes) {
        const teacherSubjects = cls.subjects.filter(subject => 
            subject.teacher && subject.teacher.toString() === teacherId.toString()
        );
        teachingHours += teacherSubjects.length;
    }

    return {
        totalStudents,
        averageAttendance,
        classesToday: classes.length,
        teachingHours
    };
};

const calculateLastMonthStats = async (classes, teacherId) => {
    // Calculate date range for last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const firstDayLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastDayLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    // Get unique students from last month
    const uniqueStudentIds = new Set();
    classes.forEach(cls => {
        cls.students.forEach(student => {
            uniqueStudentIds.add(student._id.toString());
        });
    });
    const totalStudents = uniqueStudentIds.size;

    // Calculate last month's average attendance
    const lastMonthAttendance = await StudentAttendance.find({
        student: { $in: Array.from(uniqueStudentIds) },
        date: {
            $gte: firstDayLastMonth,
            $lte: lastDayLastMonth
        }
    });

    const totalDays = lastMonthAttendance.length / uniqueStudentIds.size || 1;
    const presentCount = lastMonthAttendance.filter(record => 
        record.status === 'present'
    ).length;

    const averageAttendance = totalDays > 0 
        ? Math.round((presentCount / (totalDays * uniqueStudentIds.size)) * 100) 
        : 0;

    // Calculate last month's teaching hours
    let teachingHours = 0;
    for (const cls of classes) {
        const teacherSubjects = cls.subjects.filter(subject => 
            subject.teacher && subject.teacher.toString() === teacherId.toString()
        );
        teachingHours += teacherSubjects.length * 20; // Assuming 20 teaching days in a month
    }

    return {
        totalStudents,
        averageAttendance,
        classesToday: classes.length,
        teachingHours
    };
};

const calculateChange = (current, previous) => {
    if (previous === 0) return '0.0';
    return ((current - previous) / previous * 100).toFixed(1);
};

module.exports = {
    getDashboardStats
};