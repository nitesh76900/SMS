const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    class: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class', 
        required: [true, 'Class is required.'] 
    },
    day: { 
        type: String, 
        required: [true, 'Day is required.'], 
        enum: {
            values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            message: '{VALUE} is not a valid day.'
        }
    },
    periods: [
        {
            periodNumber: { 
                type: Number, 
                required: [true, 'Period number is required.'],
                min: [1, 'Period number must be at least 1.'],
                validate: {
                    validator: Number.isInteger,
                    message: 'Period number must be an integer.'
                }
            },
            subject: { 
                type: String, 
                required: [true, 'Subject is required.'] 
            },
            teacher: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Teacher', 
                required: [true, 'Teacher is required.'] 
            },
            startTime: { 
                type: String, 
                required: [true, 'Start time is required.'],
                validate: {
                    validator: function(v) {
                        return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(v);
                    },
                    message: props => `${props.value} is not a valid time format. Use 'HH:MM AM/PM'.`
                }
            },
            endTime: { 
                type: String, 
                required: [true, 'End time is required.'],
                validate: {
                    validator: function(v) {
                        return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(v);
                    },
                    message: props => `${props.value} is not a valid time format. Use 'HH:MM AM/PM'.`
                }
            },
        }
    ]
});

// Custom pre-save hook to ensure endTime is after startTime
timetableSchema.pre('save', function(next) {
    this.periods.forEach(period => {
        const [startHour, startMinute] = period.startTime.match(/\d+/g).map(Number);
        const [endHour, endMinute] = period.endTime.match(/\d+/g).map(Number);

        // Convert to 24-hour format for comparison
        const isStartAM = /AM$/.test(period.startTime);
        const isEndAM = /AM$/.test(period.endTime);
        const startInMinutes = (isStartAM ? startHour % 12 : startHour % 12 + 12) * 60 + startMinute;
        const endInMinutes = (isEndAM ? endHour % 12 : endHour % 12 + 12) * 60 + endMinute;

        if (endInMinutes <= startInMinutes) {
            return next(new Error(`End time ${period.endTime} must be after start time ${period.startTime} for period ${period.periodNumber}.`));
        }
    });
    next();
});

const TimeTable = mongoose.model('TimeTable', timetableSchema);
module.exports = TimeTable