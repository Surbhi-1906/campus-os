import React, { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import { AttendanceSubject, createId, loadAttendance, saveAttendance } from '../utils/dashboardStorage';

const AttendanceSection: React.FC = () => {
  const [data, setData] = useState(loadAttendance);
  const [subjectName, setSubjectName] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [countErrors, setCountErrors] = useState<Record<string, string>>({});
  const [safeInput, setSafeInput] = useState(`${data.safeThreshold}`);
  const [watchInput, setWatchInput] = useState(`${data.watchThreshold}`);
  const [thresholdError, setThresholdError] = useState('');

  const updateData = (nextData: typeof data) => {
    setData(nextData);
    saveAttendance(nextData);
  };

  const addSubject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = subjectName.trim();
    if (!name) return;
    if (data.subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
      setSubjectError('A subject with that name already exists.');
      return;
    }
    const subject: AttendanceSubject = { id: createId(), name, attended: 0, total: 0 };
    updateData({ ...data, subjects: [...data.subjects, subject] });
    setSubjectName('');
    setSubjectError('');
  };

  const recordClass = (id: string, present: boolean) => {
    updateData({
      ...data,
      subjects: data.subjects.map((subject) =>
        subject.id === id
          ? { ...subject, attended: subject.attended + (present ? 1 : 0), total: subject.total + 1 }
          : subject,
      ),
    });
  };

  const updateClassCount = (id: string, field: 'attended' | 'total', rawValue: string) => {
    if (rawValue === '') {
      setCountErrors((errors) => ({ ...errors, [id]: 'Enter a whole number of classes.' }));
      return;
    }

    const value = Number(rawValue);
    const subject = data.subjects.find((item) => item.id === id);
    if (!subject) return;
    if (!Number.isInteger(value) || value < 0) {
      setCountErrors((errors) => ({ ...errors, [id]: 'Class counts must be whole numbers of zero or more.' }));
      return;
    }
    if (field === 'attended' && value > subject.total) {
      setCountErrors((errors) => ({ ...errors, [id]: 'Attended classes cannot exceed total classes.' }));
      return;
    }
    if (field === 'total' && value < subject.attended) {
      setCountErrors((errors) => ({ ...errors, [id]: 'Total classes cannot be less than attended classes.' }));
      return;
    }

    setCountErrors((errors) => {
      const nextErrors = { ...errors };
      delete nextErrors[id];
      return nextErrors;
    });
    updateData({
      ...data,
      subjects: data.subjects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    });
  };

  const startRename = (subject: AttendanceSubject) => {
    setEditingSubjectId(subject.id);
    setEditingSubjectName(subject.name);
    setSubjectError('');
  };

  const saveRename = (id: string) => {
    const name = editingSubjectName.trim();
    if (!name) {
      setSubjectError('Subject name cannot be empty.');
      return;
    }
    if (
      data.subjects.some(
        (subject) => subject.id !== id && subject.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setSubjectError('A subject with that name already exists.');
      return;
    }
    updateData({
      ...data,
      subjects: data.subjects.map((subject) => (subject.id === id ? { ...subject, name } : subject)),
    });
    setEditingSubjectId(null);
    setEditingSubjectName('');
    setSubjectError('');
  };

  const deleteSubject = (id: string) => {
    updateData({ ...data, subjects: data.subjects.filter((subject) => subject.id !== id) });
    setCountErrors((errors) => {
      const nextErrors = { ...errors };
      delete nextErrors[id];
      return nextErrors;
    });
    if (editingSubjectId === id) setEditingSubjectId(null);
  };

  const updateThresholds = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeThreshold = Number(safeInput);
    const watchThreshold = Number(watchInput);
    if (
      !Number.isFinite(safeThreshold) ||
      !Number.isFinite(watchThreshold) ||
      safeThreshold > 100 ||
      safeThreshold < 1 ||
      watchThreshold < 0 ||
      watchThreshold >= safeThreshold
    ) {
      setThresholdError('Set valid percentages from 0–100, with SAFE higher than WATCH.');
      return;
    }

    updateData({ ...data, safeThreshold, watchThreshold });
    setThresholdError('');
  };

  const getAttendance = (subject: AttendanceSubject): number =>
    subject.total === 0 ? 0 : Math.round((subject.attended / subject.total) * 100);

  const getStatus = (percentage: number) => {
    if (percentage >= data.safeThreshold) {
      return { label: 'SAFE', classes: 'border-green-300/20 bg-green-300/10 text-green-200' };
    }
    if (percentage >= data.watchThreshold) {
      return { label: 'WATCH', classes: 'border-butter/20 bg-butter/10 text-butter' };
    }
    return { label: 'LOW', classes: 'border-red-300/20 bg-red-300/10 text-red-200' };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <DashboardHeader
        eyebrow="SHOW UP, STAY IN THE CLEAR"
        title="ATTENDANCE"
        description="A clear read on every class, with a quick heads-up before one missed lecture changes your standing."
      />

      <form onSubmit={updateThresholds} className="glass-card mb-6 p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="font-display text-lg font-semibold text-cream">Your attendance guardrails</h3>
          <p className="mt-1 text-sm text-beige">Set the minimum percentages used for SAFE and WATCH status.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-beige">
            SAFE from
            <div className="mt-2 flex items-center gap-3">
              <input
                aria-label="Safe attendance threshold"
                className="input-field w-full"
                max="100"
                min={data.watchThreshold + 1}
                onChange={(event) => setSafeInput(event.target.value)}
                type="number"
                value={safeInput}
              />
              <span className="text-butter">%</span>
            </div>
          </label>
          <label className="block text-sm text-beige">
            WATCH from
            <div className="mt-2 flex items-center gap-3">
              <input
                aria-label="Watch attendance threshold"
                className="input-field w-full"
                max={data.safeThreshold - 1}
                min="0"
                onChange={(event) => setWatchInput(event.target.value)}
                type="number"
                value={watchInput}
              />
              <span className="text-butter">%</span>
            </div>
          </label>
        </div>
        <p className="mt-3 text-xs text-beige/70">
          Below {data.watchThreshold}% is LOW. SAFE must be higher than WATCH.
        </p>
        {thresholdError && <p aria-live="polite" className="mt-3 text-sm text-red-200">{thresholdError}</p>}
        <button className="accent-button mt-4 py-2.5 text-sm" type="submit">SAVE THRESHOLDS</button>
      </form>

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ['SAFE', 'text-green-200'],
          ['WATCH', 'text-butter'],
          ['LOW', 'text-red-200'],
        ].map(([label, color]) => (
          <span key={label} className={`rounded-full border border-beige/10 bg-espresso/30 px-3 py-1.5 text-xs font-semibold tracking-wider ${color}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.subjects.map((subject) => {
          const percentage = getAttendance(subject);
          const status = subject.total === 0
            ? { label: 'NO HISTORY', classes: 'border-beige/20 bg-beige/5 text-beige' }
            : getStatus(percentage);
          const afterMiss = subject.total === 0
            ? 0
            : Math.round((subject.attended / (subject.total + 1)) * 1000) / 10;
          const canMiss = subject.total > 0 && afterMiss >= data.safeThreshold;

          return (
            <motion.article
              key={subject.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              layout
              whileHover={{ y: -4, rotateX: 0.5 }}
              className="glass-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingSubjectId === subject.id ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        aria-label="Edit subject name"
                        autoFocus
                        className="input-field min-w-0 flex-1 py-2"
                        onChange={(event) => setEditingSubjectName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            saveRename(subject.id);
                          }
                        }}
                        value={editingSubjectName}
                      />
                      <button className="accent-button px-4 py-2 text-sm" onClick={() => saveRename(subject.id)} type="button">
                        SAVE
                      </button>
                      <button
                        className="accent-button-outline px-4 py-2 text-sm"
                        onClick={() => {
                          setEditingSubjectId(null);
                          setSubjectError('');
                        }}
                        type="button"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <h3 className="break-words font-display text-xl font-semibold text-cream">{subject.name}</h3>
                  )}
                  <p className="mt-1 text-sm text-beige">
                    {subject.attended} attended <span className="px-1 text-beige/50">/</span> {subject.total} total classes
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.16em] ${status.classes}`}>
                  {status.label}
                </span>
              </div>
              <div className="my-5 flex items-end justify-between">
                <motion.p
                  key={`${subject.id}-${percentage}`}
                  initial={{ opacity: 0.55, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="number-display font-display text-4xl font-bold text-butter"
                >
                  {percentage}%
                </motion.p>
                <p className="text-xs text-beige">current attendance</p>
              </div>
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-espresso/70">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${status.label === 'LOW' ? 'bg-red-300' : 'bg-butter'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mb-5 grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold tracking-[0.1em] text-beige">
                  ATTENDED
                  <input
                    aria-label={`${subject.name} attended classes`}
                    className="input-field mt-2 w-full py-2 text-base font-semibold text-cream"
                    max={subject.total}
                    min="0"
                    onChange={(event) => updateClassCount(subject.id, 'attended', event.target.value)}
                    type="number"
                    value={subject.attended}
                  />
                </label>
                <label className="block text-xs font-semibold tracking-[0.1em] text-beige">
                  TOTAL CLASSES
                  <input
                    aria-label={`${subject.name} total classes`}
                    className="input-field mt-2 w-full py-2 text-base font-semibold text-cream"
                    min={subject.attended}
                    onChange={(event) => updateClassCount(subject.id, 'total', event.target.value)}
                    type="number"
                    value={subject.total}
                  />
                </label>
              </div>
              {countErrors[subject.id] && (
                <p aria-live="polite" className="mb-4 rounded-lg border border-red-300/20 bg-red-300/5 px-3 py-2 text-sm text-red-200">
                  {countErrors[subject.id]}
                </p>
              )}
              <div className="mb-5 rounded-lg border border-beige/10 bg-espresso/30 p-3">
                <p className="text-xs font-semibold tracking-[0.14em] text-beige">CAN I MISS THIS CLASS?</p>
                <p className={`mt-1 text-sm ${subject.total === 0 ? 'text-beige' : canMiss ? 'text-green-200' : 'text-butter'}`}>
                  {subject.total === 0
                    ? 'Not enough attendance history yet. Record a class to see the estimate.'
                    : `Current ${percentage}% → ${subject.attended}/${subject.total + 1} after missing (${afterMiss}%). ${canMiss ? 'Still within your SAFE range.' : 'Below your SAFE threshold.'}`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.96 }} className="accent-button py-2.5 text-sm" onClick={() => recordClass(subject.id, true)} type="button">
                  PRESENT
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} className="accent-button-outline py-2.5 text-sm" onClick={() => recordClass(subject.id, false)} type="button">
                  ABSENT
                </motion.button>
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t border-beige/10 pt-3">
                {editingSubjectId !== subject.id && (
                  <button
                    className="rounded-lg px-3 py-2 text-xs font-semibold tracking-wider text-beige transition-colors hover:bg-butter/10 hover:text-butter"
                    onClick={() => startRename(subject)}
                    type="button"
                  >
                    RENAME
                  </button>
                )}
                <button
                  className="rounded-lg px-3 py-2 text-xs font-semibold tracking-wider text-beige transition-colors hover:bg-red-300/10 hover:text-red-200"
                  onClick={() => deleteSubject(subject.id)}
                  type="button"
                >
                  DELETE
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {data.subjects.length === 0 && (
        <div className="glass-card mb-5 p-8 text-center">
          <p className="font-display text-lg font-semibold text-cream">Your attendance, made simple.</p>
          <p className="mt-2 text-sm text-beige">Add a subject below to start tracking classes.</p>
        </div>
      )}

      <form onSubmit={addSubject} className="glass-card mt-6 p-5 sm:p-6">
        <label htmlFor="attendance-subject" className="mb-3 block font-display text-lg font-semibold text-cream">
          Add a subject
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="attendance-subject"
            className="input-field min-w-0 flex-1"
            onChange={(event) => setSubjectName(event.target.value)}
            onFocus={() => setSubjectError('')}
            placeholder="e.g. Digital Systems"
            value={subjectName}
          />
          <button className="accent-button px-5 py-3" type="submit">ADD SUBJECT</button>
        </div>
        {subjectError && <p aria-live="polite" className="mt-3 text-sm text-red-200">{subjectError}</p>}
      </form>
    </div>
  );
};

export default AttendanceSection;
