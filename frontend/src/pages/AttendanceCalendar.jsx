import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Select, MenuItem, FormControl, InputLabel, Paper } from '@mui/material';
import { enUS } from 'date-fns/locale';
import { useToast } from "../context/ToastContext";

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const AttendanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const showToast = useToast();

  // Dummy attendance data - replace this with actual API call
  const generateDummyData = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date <= new Date()) { // Only add data for past dates
        const totalStudents = 120; // Total number of students
        const presentStudents = Math.floor(Math.random() * (120 - 100) + 100); // Random number between 100-120
        data.push({
          title: `${presentStudents}/${totalStudents} Present`,
          start: date,
          end: date,
          presentCount: presentStudents,
          totalStudents: totalStudents,
          allDay: true,
        });
      }
    }
    return data;
  };

  // Event component to show attendance counts
  const EventComponent = ({ event }) => (
    <div className="p-1 text-sm">
      <div 
        className={`text-center rounded-md p-1 ${
          (event.presentCount / event.totalStudents) * 100 >= 95 
            ? 'bg-green-100 text-green-800' 
            : (event.presentCount / event.totalStudents) * 100 >= 90 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-red-100 text-red-800'
        }`}
      >
        {event.title}
      </div>
    </div>
  );

  // Custom toolbar with working navigation
  const CustomToolbar = (toolbar) => {
    const years = Array.from({ length: 5 }, (_, i) => 
      new Date().getFullYear() - i
    );

    const goToBack = () => {
      const newDate = subMonths(toolbar.date, 1);
      setCurrentDate(newDate);
      toolbar.onNavigate('prev', newDate);
    };

    const goToNext = () => {
      const newDate = addMonths(toolbar.date, 1);
      if (newDate <= new Date()) {
        setCurrentDate(newDate);
        toolbar.onNavigate('next', newDate);
      }
    };

    const goToToday = () => {
      const now = new Date();
      setCurrentDate(now);
      toolbar.onNavigate('current', now);
    };

    const handleYearChange = (e) => {
      const newYear = e.target.value;
      if (newYear > new Date().getFullYear()) {
        showToast("Cannot select future years", "error");
        return;
      }
      setSelectedYear(newYear);
      const newDate = new Date(currentDate.setFullYear(newYear));
      setCurrentDate(newDate);
      showToast(`Showing attendance for ${newYear}`, "info");
    };

    return (
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md"
            onClick={goToBack}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md"
            onClick={goToToday}
          >
            This Month
          </button>
          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md"
            onClick={goToNext}
            disabled={format(addMonths(toolbar.date, 1), 'yyyy-MM') > format(new Date(), 'yyyy-MM')}
          >
            Next
          </button>
          <h2 className="text-xl font-semibold mx-4">
            {format(toolbar.date, 'MMMM yyyy')}
          </h2>
        </div>
        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            label="Year"
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  };

  // Get events for the current month
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const attendanceEvents = generateDummyData(currentYear, currentMonth);

  return (
    <Paper elevation={3} className="p-4">
      <div style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={attendanceEvents}
          startAccessor="start"
          endAccessor="end"
          views={['month']}
          defaultView="month"
          components={{
            event: EventComponent,
            toolbar: CustomToolbar,
          }}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          formats={{
            monthHeaderFormat: 'MMMM yyyy',
          }}
          style={{ height: '100%' }}
        />
      </div>
    </Paper>
  );
};

export default AttendanceCalendar;