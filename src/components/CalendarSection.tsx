import React, { FormEvent, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import CalendarView, { CalendarDisplayItem } from './CalendarView';
import {
  CalendarCategory,
  CalendarEvent,
  createId,
  getDateKey,
  loadAcademics,
  loadCalendarEvents,
  saveCalendarEvents,
} from '../utils/dashboardStorage';

const CalendarSection: React.FC = () => {
  const [events, setEvents] = useState(loadCalendarEvents);
  const [academics] = useState(loadAcademics);
  const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => getDateKey(new Date()));
  const [time, setTime] = useState('12:00');
  const [category, setCategory] = useState<CalendarCategory>('PERSONAL');

  const items = useMemo<CalendarDisplayItem[]>(() => {
    const academicItems: CalendarDisplayItem[] = academics.tasks
      .filter((task) => task.deadline)
      .map((task) => ({
        id: task.id,
        title: task.title,
        date: task.deadline,
        time: '23:59',
        category: 'ACADEMICS',
        kind: 'task',
        subject: task.subject,
        completed: task.completed,
      }));
    const eventItems: CalendarDisplayItem[] = events.map((event: CalendarEvent) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      category: event.category,
      kind: 'event',
    }));

    return [...academicItems, ...eventItems];
  }, [academics.tasks, events]);

  const saveEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const eventTitle = title.trim();
    if (!eventTitle || !date || !time) return;

    const newEvent: CalendarEvent = {
      id: createId(),
      title: eventTitle,
      date,
      time,
      category,
    };
    const nextEvents = [...events, newEvent];
    setEvents(nextEvents);
    saveCalendarEvents(nextEvents);
    setSelectedDate(date);
    setTitle('');
    setIsFormOpen(false);
  };

  const deleteEvent = (id: string) => {
    const nextEvents = events.filter((event) => event.id !== id);
    setEvents(nextEvents);
    saveCalendarEvents(nextEvents);
  };

  const openAddForm = () => {
    setDate(selectedDate);
    setIsFormOpen((open) => !open);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <DashboardHeader
        eyebrow="WHAT'S NEXT, AT A GLANCE"
        title="CALENDAR"
        description="Academic deadlines flow in directly from Academics. Add the club plans, project moments, and personal events around them."
      />

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-butter/15 bg-butter/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-butter">YOUR CAMPUS, IN RHYTHM</p>
          <p className="mt-1 text-sm text-cream">
            Select a day to see what is on. Academic task deadlines appear here automatically.
          </p>
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="accent-button w-full shrink-0 sm:w-auto"
          onClick={openAddForm}
          type="button"
        >
          {isFormOpen ? 'CLOSE FORM' : 'ADD EVENT'}
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            onSubmit={saveEvent}
            className="glass-card mb-5 overflow-hidden p-5 sm:p-6"
          >
            <div className="mb-5">
              <h2 className="font-display text-xl font-semibold text-cream">Add to your calendar</h2>
              <p className="mt-1 text-sm text-beige">Pick a title, time, and a little context.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                autoFocus
                className="input-field sm:col-span-2 lg:col-span-1"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Event title"
                required
                value={title}
              />
              <input
                aria-label="Event date"
                className="input-field"
                onChange={(event) => setDate(event.target.value)}
                required
                type="date"
                value={date}
              />
              <input
                aria-label="Event time"
                className="input-field"
                onChange={(event) => setTime(event.target.value)}
                required
                type="time"
                value={time}
              />
              <select
                aria-label="Event category"
                className="input-field"
                onChange={(event) => setCategory(event.target.value as CalendarCategory)}
                value={category}
              >
                <option value="ACADEMICS">ACADEMICS</option>
                <option value="PROJECT">PROJECT</option>
                <option value="CLUB">CLUB</option>
                <option value="PERSONAL">PERSONAL</option>
              </select>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.button whileTap={{ scale: 0.97 }} className="accent-button w-full sm:w-auto" type="submit">SAVE EVENT</motion.button>
              <button
                className="accent-button-outline w-full py-2.5 sm:w-auto"
                onClick={() => setIsFormOpen(false)}
                type="button"
              >
                CANCEL
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <CalendarView
        items={items}
        onDeleteEvent={deleteEvent}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarSection;
