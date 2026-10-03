import React, { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import {
  AcademicTask,
  createId,
  getDateKey,
  loadAcademics,
  saveAcademics,
  TaskPriority,
} from '../utils/dashboardStorage';

const priorityStyles: Record<TaskPriority, string> = {
  HIGH: 'border-red-300/20 bg-red-300/10 text-red-200',
  MEDIUM: 'border-butter/20 bg-butter/10 text-butter',
  LOW: 'border-beige/20 bg-beige/5 text-beige',
};

const AcademicsSection: React.FC = () => {
  const [data, setData] = useState(loadAcademics);
  const [subjectInput, setSubjectInput] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState(data.subjects[0] ?? '');
  const [taskDeadline, setTaskDeadline] = useState(getDateKey(new Date()));
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');

  const today = getDateKey(new Date());
  const completedTasks = data.tasks.filter((task) => task.completed);
  const dueToday = data.tasks.filter((task) => !task.completed && task.deadline === today);
  const upcoming = data.tasks
    .filter((task) => !task.completed && task.deadline !== today)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const progress = data.tasks.length === 0 ? 0 : Math.round((completedTasks.length / data.tasks.length) * 100);

  const sortedSubjects = useMemo(() => [...data.subjects].sort((a, b) => a.localeCompare(b)), [data.subjects]);

  const updateData = (nextData: typeof data) => {
    setData(nextData);
    saveAcademics(nextData);
  };

  const addSubject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = subjectInput.trim();
    if (!name || data.subjects.some((subject) => subject.toLowerCase() === name.toLowerCase())) return;
    updateData({ ...data, subjects: [...data.subjects, name] });
    setTaskSubject(name);
    setSubjectInput('');
  };

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title || !taskSubject || !taskDeadline) return;

    const task: AcademicTask = {
      id: createId(),
      title,
      subject: taskSubject,
      deadline: taskDeadline,
      priority: taskPriority,
      completed: false,
    };
    updateData({ ...data, tasks: [task, ...data.tasks] });
    setTaskTitle('');
  };

  const toggleTask = (taskId: string) => {
    updateData({
      ...data,
      tasks: data.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    });
  };

  const renderTask = (task: AcademicTask, index: number) => (
    <motion.li
      key={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      layout
      whileHover={{ y: -2 }}
      className="flex flex-col gap-4 rounded-xl border border-beige/10 bg-espresso/30 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <input
          aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
          checked={task.completed}
          className="mt-1 h-4 w-4 shrink-0 accent-butter"
          onChange={() => toggleTask(task.id)}
          type="checkbox"
        />
        <div className="min-w-0">
          <p className={`font-medium ${task.completed ? 'text-beige line-through' : 'text-cream'}`}>
            {task.title}
          </p>
          <p className="mt-1 text-sm text-beige">
            {task.subject} <span className="px-1 text-beige/40">·</span>{' '}
            {new Date(`${task.deadline}T00:00:00`).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
            {task.deadline < today && !task.completed && (
              <span className="ml-2 font-medium text-red-200">OVERDUE</span>
            )}
          </p>
        </div>
      </div>
      <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.16em] ${priorityStyles[task.priority]}`}>
        {task.priority}
      </span>
    </motion.li>
  );

  const renderTaskGroup = (title: string, tasks: AcademicTask[], emptyMessage: string) => (
    <section className="glass-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-cream">{title}</h3>
        <span className="rounded-full bg-chocolate/70 px-2.5 py-1 text-xs text-beige">{tasks.length}</span>
      </div>
      {tasks.length > 0 ? (
        <ul className="space-y-3">{tasks.map(renderTask)}</ul>
      ) : (
        <p className="rounded-xl border border-dashed border-beige/15 px-4 py-6 text-center text-sm text-beige">
          {emptyMessage}
        </p>
      )}
    </section>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <DashboardHeader
        eyebrow="YOUR STUDY DESK"
        title="ACADEMICS"
        description="Keep coursework in one calm place. Add a subject, capture the next deadline, and make progress one task at a time."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <motion.section whileHover={{ y: -3 }} className="glass-card p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-beige">TASK PROGRESS</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="font-display text-3xl font-bold text-cream">
              {completedTasks.length}<span className="text-beige"> / {data.tasks.length}</span>
            </p>
            <p className="text-sm font-semibold text-butter">{progress}% complete</p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-espresso/70">
            <div className="h-full rounded-full bg-butter transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
        </motion.section>
        <motion.section whileHover={{ y: -3 }} className="glass-card p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-beige">YOUR SUBJECTS</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {sortedSubjects.map((subject) => (
              <span key={subject} className="rounded-full border border-beige/15 bg-espresso/30 px-3 py-1.5 text-sm text-cream">
                {subject}
              </span>
            ))}
            {sortedSubjects.length === 0 && <span className="text-sm text-beige">Add your first subject below.</span>}
          </div>
        </motion.section>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[0.85fr_1.5fr]">
        <form onSubmit={addSubject} className="glass-card p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg font-semibold text-cream">Add a subject</h3>
          <p className="mb-4 text-sm text-beige">Build your own course list.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="input-field min-w-0 flex-1"
              onChange={(event) => setSubjectInput(event.target.value)}
              placeholder="e.g. Data Structures"
              value={subjectInput}
            />
            <button className="accent-button px-5 py-3" type="submit">ADD</button>
          </div>
        </form>

        <form onSubmit={addTask} className="glass-card p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg font-semibold text-cream">Capture a task</h3>
          <p className="mb-4 text-sm text-beige">Your academic deadlines also appear in Calendar.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              className="input-field sm:col-span-2 lg:col-span-1"
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Assignment or task"
              required
              value={taskTitle}
            />
            <select
              className="input-field"
              onChange={(event) => setTaskSubject(event.target.value)}
              required
              value={taskSubject}
            >
              {sortedSubjects.length === 0 && <option value="">Add a subject first</option>}
              {sortedSubjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
            </select>
            <input
              aria-label="Task deadline"
              className="input-field"
              onChange={(event) => setTaskDeadline(event.target.value)}
              required
              type="date"
              value={taskDeadline}
            />
            <select
              aria-label="Task priority"
              className="input-field"
              onChange={(event) => setTaskPriority(event.target.value as TaskPriority)}
              value={taskPriority}
            >
              <option value="HIGH">High priority</option>
              <option value="MEDIUM">Medium priority</option>
              <option value="LOW">Low priority</option>
            </select>
          </div>
          <button className="accent-button mt-3 w-full sm:w-auto" disabled={sortedSubjects.length === 0} type="submit">
            ADD TASK
          </button>
        </form>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {renderTaskGroup('Due today', dueToday, 'Nothing due today. Keep that breathing room.')}
        {renderTaskGroup('Upcoming', upcoming, 'No upcoming work. Add a task when something lands.')}
        <div className="lg:col-span-2">
          {renderTaskGroup('Completed', completedTasks, 'Completed tasks will settle here.')}
        </div>
      </div>
    </div>
  );
};

export default AcademicsSection;
