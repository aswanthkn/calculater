import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const today = new Date();
  const currentDate = {
    day: today.getDate(),
    month: today.getMonth(),
    year: today.getFullYear(),
  };

  // Indian Government Holidays (fixed dates)
  const fixedHolidays = {
    '1-1': 'New Year\'s Day',
    '1-26': 'Republic Day',
    '8-15': 'Independence Day',
    '10-2': 'Gandhi Jayanti',
    '12-25': 'Christmas Day'
  };

  // Indian Government Holidays (variable dates - approximate for 2023)
  const variableHolidays = {
    '2024-1-15': 'Makar Sankranti/Pongal',
    '2024-1-26': 'Republic Day',
    '2024-3-8': 'Mahashivratri',
    '2024-3-25': 'Holi',
    '2024-4-9': 'Ram Navami',
    '2024-4-17': 'Mahavir Jayanti',
    '2024-5-23': 'Buddha Purnima',
    '2024-6-29': 'Eid al-Adha',
    '2024-8-15': 'Independence Day',
    '2024-9-6': 'Janmashtami',
    '2024-10-2': 'Gandhi Jayanti',
    '2024-10-12': 'Dussehra',
    '2024-10-31': 'Diwali',
    '2024-11-15': 'Guru Nanak Jayanti',
    '2024-12-25': 'Christmas Day'
  };

  // Initialize state with localStorage data if available
  const [currentMonth, setCurrentMonth] = useState(currentDate.month);
  const [currentYear, setCurrentYear] = useState(currentDate.year);
  const [selectedDate, setSelectedDate] = useState(null);
  const [note, setNote] = useState('');
  const [dateNotes, setDateNotes] = useState(() => {
    try {
      const savedNotes = localStorage.getItem('calendarNotes');
      return savedNotes ? JSON.parse(savedNotes) : {};
    } catch (e) {
      console.error("Failed to load notes:", e);
      return {};
    }
  });
  const [events, setEvents] = useState(() => {
    try {
      const savedEvents = localStorage.getItem('calendarEvents');
      return savedEvents ? JSON.parse(savedEvents) : {};
    } catch (e) {
      console.error("Failed to load events:", e);
      return {};
    }
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('calendarNotes', JSON.stringify(dateNotes));
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }, [dateNotes, events]);

  const isHoliday = (day) => {
    // Check fixed holidays (same date every year)
    const fixedKey = `${currentMonth + 1}-${day}`;
    if (fixedHolidays[fixedKey]) {
      return fixedHolidays[fixedKey];
    }
    
    // Check variable holidays (specific dates)
    const variableKey = `${currentYear}-${currentMonth + 1}-${day}`;
    if (variableHolidays[variableKey]) {
      return variableHolidays[variableKey];
    }
    
    return false;
  };

  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();
    const calendarDays = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      calendarDays.push(week);
    }

    return calendarDays;
  };

  const changeMonth = (offset) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  };

  const isToday = (day) => {
    return (
      day === currentDate.day &&
      currentMonth === currentDate.month &&
      currentYear === currentDate.year
    );
  };

  const hasEvents = (day) => {
    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
    return events[dateKey] && events[dateKey].length > 0;
  };

  const getEventsForDay = (day) => {
    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
    return events[dateKey] || [];
  };

  const handleDateClick = (day) => {
    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
    setSelectedDate(dateKey);
    setNote(dateNotes[dateKey] || '');
  };

  const saveNote = () => {
    if (!selectedDate) return;
    
    const updatedNotes = {
      ...dateNotes,
      [selectedDate]: note
    };
    
    setDateNotes(updatedNotes);
  };

  const addEvent = () => {
    if (!selectedDate) return;
    
    const eventTitle = prompt("Enter event title:");
    if (!eventTitle) return;
    
    const eventTime = prompt("Enter event time (e.g., 10:00 AM):");
    if (!eventTime) return;
    
    const newEvent = {
      title: eventTitle,
      time: eventTime,
      date: selectedDate
    };
    
    const updatedEvents = {
      ...events,
      [selectedDate]: [...(events[selectedDate] || []), newEvent]
    };
    
    setEvents(updatedEvents);
  };

  const deleteNote = () => {
    if (!selectedDate) return;
    
    const updatedNotes = {...dateNotes};
    delete updatedNotes[selectedDate];
    setDateNotes(updatedNotes);
    setNote('');
  };

  const deleteEvent = (eventIndex) => {
    if (!selectedDate) return;
    
    const updatedEvents = {...events};
    updatedEvents[selectedDate] = updatedEvents[selectedDate].filter((_, index) => index !== eventIndex);
    
    if (updatedEvents[selectedDate].length === 0) {
      delete updatedEvents[selectedDate];
    }
    
    setEvents(updatedEvents);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-button today" onClick={() => {
            setCurrentMonth(currentDate.month);
            setCurrentYear(currentDate.year);
          }}>
            Today
          </button>
          <div className="month-nav">
            <button className="nav-button" onClick={() => changeMonth(-1)}>&lt;</button>
            <h3 className="month-title">{monthNames[currentMonth]} {currentYear}</h3>
            <button className="nav-button" onClick={() => changeMonth(1)}>&gt;</button>
          </div>
          <div className="month-year-select">
            <select 
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              className="select-month"
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
            <select 
              value={currentYear} 
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="select-year"
            >
              {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {dayNames.map((day) => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {generateCalendar(currentMonth, currentYear).map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
{week.map((day, dayIndex) => {
  if (!day) return <div key={dayIndex} className="calendar-day empty"></div>;
  
  const dayHasEvents = hasEvents(day);
  const dateNote = dateNotes[`${currentYear}-${currentMonth + 1}-${day}`];
  const holiday = isHoliday(day);
  const isSunday = new Date(currentYear, currentMonth, day).getDay() === 0;

  return (
    <div
      key={dayIndex}
      className={`calendar-day 
        ${isToday(day) ? 'today' : ''} 
        ${dayHasEvents ? 'has-events' : ''} 
        ${holiday ? 'holiday' : ''}
        ${isSunday ? 'sunday' : ''}`}
      onClick={() => handleDateClick(day)}
    >
      <div className="day-number">{day}</div>
      {holiday ? (
        <div className="holiday-name">
          {holiday}
        </div>
      ) : isSunday ? (
        <div className="holiday-name">
          Sunday
        </div>
      ) : null}
      {dateNote && !holiday && !isSunday && (
        <div className="date-note-preview">
          {dateNote}
        </div>
      )}
      {/* Rest of the day content */}
    </div>
  );
})}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="note-section">
          <h3>
            {monthNames[currentMonth]} {selectedDate.split('-')[2]}, {currentYear}
            {isHoliday(parseInt(selectedDate.split('-')[2])) && (
              <span className="holiday-badge">Public Holiday: {isHoliday(parseInt(selectedDate.split('-')[2]))}</span>
            )}
          </h3>
          
          <div className="events-section">
            <h4>Events</h4>
            {getEventsForDay(selectedDate.split('-')[2]).length > 0 ? (
              <ul className="events-list">
                {getEventsForDay(selectedDate.split('-')[2]).map((event, index) => (
                  <li key={index} className="event-item">
                    <span>{event.time} - {event.title}</span>
                    <button 
                      onClick={() => deleteEvent(index)}
                      className="delete-event-button"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events for this day</p>
            )}
            <button onClick={addEvent} className="add-event-button">
              Add Event
            </button>
          </div>
          
          <div className="notes-section">
            <h4>Notes</h4>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your note here..."
              className="note-textarea"
            />
            <div className="note-actions">
              <button onClick={saveNote} className="save-note-button">
                Save Note
              </button>
              <button onClick={deleteNote} className="delete-note-button">
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;