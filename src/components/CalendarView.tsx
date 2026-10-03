import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getDateKey } from '../utils/dashboardStorage';

export interface CalendarDisplayItem {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  kind: 'event' | 'task';
  subject?: string;
  completed?: boolean;
}

interface CalendarViewProps {
  items: CalendarDisplayItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onDeleteEvent: (id: string) => void;
}

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const categoryStyles: Record<string, string> = {
  ACADEMICS: 'border-butter/20 bg-butter/10 text-butter',
  PROJECT: 'border-butter/20 bg-butter/[0.06] text-butter',
  CLUB: 'border-white/15 bg-white/[0.04] text-cream',
  'CLUB / PROJECT': 'border-white/15 bg-white/[0.04] text-cream',
  ATTENDANCE: 'border-green-300/20 bg-green-300/10 text-green-100',
  PERSONAL: 'border-beige/20 bg-beige/5 text-beige',
};

const getMonthDays = (month: Date): Date[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - firstWeekday + 1;
    return new Date(year, monthIndex, dayOffset);
  });
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  selectedDate,
  onSelectDate,
  onDeleteEvent,
}) => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const todayKey = getDateKey(new Date());
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const itemsByDate = useMemo(
    () =>
      items.reduce<Record<string, CalendarDisplayItem[]>>((grouped, item) => {
        grouped[item.date] = [...(grouped[item.date] ?? []), item];
        return grouped;
      }, {}),
    [items],
  );
  const selectedItems = [...(itemsByDate[selectedDate] ?? [])].sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(nextMonth);
    onSelectDate(getDateKey(nextMonth));
  };

  const handleDateSelect = (date: Date) => {
    if (date.getMonth() !== visibleMonth.getMonth()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    onSelectDate(getDateKey(date));
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      <section aria-label="Monthly calendar" className="glass-card p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <button
            aria-label="Previous month"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-beige/10 bg-espresso/30 text-xl text-beige transition-colors hover:border-butter/30 hover:text-butter"
            onClick={() => changeMonth(-1)}
            type="button"
          >
            ‹
          </button>
          <div className="min-w-0 text-center">
            <h2 className="font-display text-xl font-bold text-cream sm:text-2xl">
              {visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <button
              className="mt-1 text-xs font-semibold tracking-[0.14em] text-butter transition-colors hover:text-cream"
              onClick={() => {
                const today = new Date();
                setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                onSelectDate(todayKey);
              }}
              type="button"
            >
              JUMP TO TODAY
            </button>
          </div>
          <button
            aria-label="Next month"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-beige/10 bg-espresso/30 text-xl text-beige transition-colors hover:border-butter/30 hover:text-butter"
            onClick={() => changeMonth(1)}
            type="button"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-beige/10 pb-2">
          {weekdays.map((weekday) => (
            <div key={weekday} className="py-2 text-center text-[9px] font-bold tracking-[0.12em] text-beige/70 sm:text-[10px] sm:tracking-[0.18em]">
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 pt-2 sm:gap-2">
          {monthDays.map((date) => {
            const dateKey = getDateKey(date);
            const dayItems = itemsByDate[dateKey] ?? [];
            const isSelected = dateKey === selectedDate;
            const isToday = dateKey === todayKey;
            const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();

            return (
              <motion.button
                key={dateKey}
                whileHover={{ scale: 1.045 }}
                whileTap={{ scale: 0.96 }}
                aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}${dayItems.length ? `, ${dayItems.length} events` : ''}`}
                aria-pressed={isSelected}
                className={`group flex min-h-[4.25rem] flex-col items-center rounded-xl border p-1.5 transition-all sm:min-h-[5.5rem] sm:p-2 ${
                  isSelected
                    ? 'border-butter/60 bg-butter/10 shadow-[0_0_18px_rgba(255,209,102,0.08)]'
                    : isToday
                      ? 'border-butter/25 bg-butter/[0.04]'
                      : 'border-transparent hover:border-beige/15 hover:bg-espresso/35'
                } ${isCurrentMonth ? 'text-cream' : 'text-beige/35'}`}
                onClick={() => handleDateSelect(date)}
                type="button"
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm ${
                  isToday ? 'bg-butter text-espresso' : isSelected ? 'text-butter' : ''
                }`}>
                  {date.getDate()}
                </span>
                <span aria-hidden="true" className="mt-auto flex h-3 items-center justify-center gap-0.5 pt-1">
                  {dayItems.length > 0 && (
                    <>
                      {dayItems.slice(0, 3).map((item) => (
                        <span
                          key={`${item.kind}-${item.id}`}
                          className={`h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${
                            item.kind === 'task' ? 'bg-butter/70' : 'bg-butter'
                          }`}
                        />
                      ))}
                      {dayItems.length > 3 && (
                        <span className="pl-0.5 text-[8px] font-semibold text-butter sm:text-[9px]">
                          +{dayItems.length - 3}
                        </span>
                      )}
                    </>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-beige/10 pt-4 text-[10px] text-beige sm:text-xs">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-butter" /> Events</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-butter/70" /> Academic deadlines</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-butter" /> Today</span>
        </div>
      </section>

      <section aria-live="polite" className="glass-card min-h-[20rem] p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-butter">
              {selectedDate === todayKey ? 'TODAY' : 'SELECTED DAY'}
            </p>
            <h3 className="mt-1 font-display text-xl font-bold text-cream">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-chocolate/70 px-2.5 py-1 text-xs text-beige">
            {selectedItems.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {selectedItems.length > 0 ? (
            <motion.ul
              key={selectedDate}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-3"
            >
              {selectedItems.map((item, index) => (
                <motion.li
                  key={`${item.kind}-${item.id}`}
                  layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: index * 0.045, duration: 0.24 }}
                  className="rounded-xl border border-beige/10 bg-espresso/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`break-words font-medium ${item.completed ? 'text-beige line-through' : 'text-cream'}`}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-beige">
                        {formatTime(item.time)}
                        {item.subject && <span> · {item.subject}</span>}
                        {item.completed && <span className="ml-2 text-green-200">DONE</span>}
                      </p>
                    </div>
                    {item.kind === 'event' && (
                      <button
                        aria-label={`Delete ${item.title}`}
                        className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold tracking-wider text-beige transition-colors hover:bg-red-300/10 hover:text-red-200"
                        onClick={() => onDeleteEvent(item.id)}
                        type="button"
                      >
                        DELETE
                      </button>
                    )}
                  </div>
                  <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] ${categoryStyles[item.category] ?? categoryStyles.PERSONAL}`}>
                    {item.kind === 'task' ? 'ACADEMICS' : item.category}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <motion.div
              key={`empty-${selectedDate}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-beige/15 px-5 text-center"
            >
              <span className="mb-3 text-2xl text-butter/70">✳</span>
              <p className="font-medium text-cream">A little breathing room.</p>
              <p className="mt-1 text-sm text-beige">Nothing scheduled for this date yet.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default CalendarView;
