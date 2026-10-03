export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ExpenseCategory = 'FOOD' | 'TRAVEL' | 'COLLEGE' | 'SHOPPING' | 'OTHER';
export type CalendarCategory = 'ACADEMICS' | 'PROJECT' | 'CLUB' | 'PERSONAL';
export type StoredCalendarCategory =
  | CalendarCategory
  | 'ATTENDANCE'
  | 'CLUB / PROJECT';

export interface AcademicTask {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  priority: TaskPriority;
  completed: boolean;
}

export interface AcademicsData {
  subjects: string[];
  tasks: AcademicTask[];
}

export interface AttendanceSubject {
  id: string;
  name: string;
  attended: number;
  total: number;
}

export interface AttendanceData {
  subjects: AttendanceSubject[];
  safeThreshold: number;
  watchThreshold: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface MoneyData {
  monthlyBudget: number;
  expenses: Expense[];
  monthlySpentOverrides?: Record<string, number>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: StoredCalendarCategory;
}

const STORAGE_KEYS = {
  academics: 'campus-os-academics',
  attendance: 'campus-os-attendance',
  money: 'campus-os-money',
  calendar: 'campus-os-calendar-events',
} as const;

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateOffset = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return getDateKey(date);
};

export const createId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const loadValue = <T,>(key: string, createDemo: () => T, isValid: (value: unknown) => value is T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const value: unknown = JSON.parse(stored);
      if (isValid(value)) return value;
      console.error(`Invalid saved data for ${key}; restoring demo data.`);
    }
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
  }

  const demo = createDemo();
  saveValue(key, demo);
  return demo;
};

const saveValue = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isAcademicTask = (value: unknown): value is AcademicTask =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.title === 'string' &&
  typeof value.subject === 'string' &&
  typeof value.deadline === 'string' &&
  (value.priority === 'HIGH' || value.priority === 'MEDIUM' || value.priority === 'LOW') &&
  typeof value.completed === 'boolean';

const isAcademicsData = (value: unknown): value is AcademicsData =>
  isRecord(value) &&
  Array.isArray(value.subjects) &&
  value.subjects.every((subject) => typeof subject === 'string') &&
  Array.isArray(value.tasks) &&
  value.tasks.every(isAcademicTask);

const isAttendanceSubject = (value: unknown): value is AttendanceSubject =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.attended === 'number' &&
  typeof value.total === 'number' &&
  Number.isInteger(value.attended) &&
  Number.isInteger(value.total) &&
  value.attended >= 0 &&
  value.total >= value.attended;

const isAttendanceData = (value: unknown): value is AttendanceData =>
  isRecord(value) &&
  Array.isArray(value.subjects) &&
  value.subjects.every(isAttendanceSubject) &&
  typeof value.safeThreshold === 'number' &&
  typeof value.watchThreshold === 'number';

const isExpense = (value: unknown): value is Expense =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.amount === 'number' &&
  value.amount > 0 &&
  (value.category === 'FOOD' ||
    value.category === 'TRAVEL' ||
    value.category === 'COLLEGE' ||
    value.category === 'SHOPPING' ||
    value.category === 'OTHER') &&
  typeof value.description === 'string' &&
  typeof value.date === 'string';

const isMoneyData = (value: unknown): value is MoneyData =>
  isRecord(value) &&
  typeof value.monthlyBudget === 'number' &&
  value.monthlyBudget >= 0 &&
  Array.isArray(value.expenses) &&
  value.expenses.every(isExpense) &&
  (value.monthlySpentOverrides === undefined ||
    (isRecord(value.monthlySpentOverrides) &&
      Object.values(value.monthlySpentOverrides).every(
        (amount) => typeof amount === 'number' && Number.isFinite(amount) && amount >= 0,
      )));

const isCalendarEvent = (value: unknown): value is CalendarEvent =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.title === 'string' &&
  typeof value.date === 'string' &&
  typeof value.time === 'string' &&
  (value.category === 'ACADEMICS' ||
    value.category === 'PROJECT' ||
    value.category === 'CLUB' ||
    value.category === 'PERSONAL' ||
    value.category === 'ATTENDANCE' ||
    value.category === 'CLUB / PROJECT' ||
    value.category === 'PERSONAL');

const isCalendarData = (value: unknown): value is CalendarEvent[] =>
  Array.isArray(value) && value.every(isCalendarEvent);

const createDemoAcademics = (): AcademicsData => ({
  subjects: ['Mathematics II', 'Electronics', 'Computer Science'],
  tasks: [
    {
      id: 'demo-maths-practical',
      title: 'Prepare lab practical notes',
      subject: 'Mathematics II',
      deadline: getDateOffset(0),
      priority: 'HIGH',
      completed: false,
    },
    {
      id: 'demo-electronics-quiz',
      title: 'Revise circuit analysis',
      subject: 'Electronics',
      deadline: getDateOffset(2),
      priority: 'MEDIUM',
      completed: false,
    },
    {
      id: 'demo-cs-project',
      title: 'Submit database mini project',
      subject: 'Computer Science',
      deadline: getDateOffset(5),
      priority: 'HIGH',
      completed: false,
    },
    {
      id: 'demo-maths-assignment',
      title: 'Problem set 04',
      subject: 'Mathematics II',
      deadline: getDateOffset(-1),
      priority: 'LOW',
      completed: true,
    },
  ],
});

const createDemoAttendance = (): AttendanceData => ({
  subjects: [
    { id: 'demo-attendance-maths', name: 'Mathematics II', attended: 0, total: 0 },
    { id: 'demo-attendance-electronics', name: 'Electronics', attended: 0, total: 0 },
    { id: 'demo-attendance-cs', name: 'Computer Science', attended: 0, total: 0 },
  ],
  safeThreshold: 75,
  watchThreshold: 60,
});

const createDemoMoney = (): MoneyData => {
  return {
    monthlyBudget: 12000,
    expenses: [
      { id: 'demo-expense-lunch', amount: 180, category: 'FOOD', description: 'Lunch at campus', date: getDateOffset(0) },
      { id: 'demo-expense-bus', amount: 60, category: 'TRAVEL', description: 'Bus pass top-up', date: getDateOffset(-1) },
      { id: 'demo-expense-print', amount: 240, category: 'COLLEGE', description: 'Project printing', date: getDateOffset(-2) },
      { id: 'demo-expense-coffee', amount: 95, category: 'FOOD', description: 'Coffee with friends', date: getDateOffset(-3) },
      { id: 'demo-expense-notebook', amount: 320, category: 'COLLEGE', description: 'Notebooks and stationery', date: getDateOffset(-4) },
    ],
  };
};

const createDemoCalendar = (): CalendarEvent[] => [
  {
    id: 'demo-calendar-attendance',
    title: 'Check in before Electronics lecture',
    date: getDateOffset(1),
    time: '09:00',
    category: 'ATTENDANCE',
  },
  {
    id: 'demo-calendar-club',
    title: 'Design club project sync',
    date: getDateOffset(3),
    time: '17:30',
    category: 'CLUB / PROJECT',
  },
  {
    id: 'demo-calendar-personal',
    title: 'Pick up library holds',
    date: getDateOffset(4),
    time: '15:00',
    category: 'PERSONAL',
  },
];

export const loadAcademics = (): AcademicsData =>
  loadValue(STORAGE_KEYS.academics, createDemoAcademics, isAcademicsData);
export const saveAcademics = (data: AcademicsData): void => saveValue(STORAGE_KEYS.academics, data);

export const loadAttendance = (): AttendanceData =>
  loadValue(STORAGE_KEYS.attendance, createDemoAttendance, isAttendanceData);
export const saveAttendance = (data: AttendanceData): void => saveValue(STORAGE_KEYS.attendance, data);

export const loadMoney = (): MoneyData => loadValue(STORAGE_KEYS.money, createDemoMoney, isMoneyData);
export const saveMoney = (data: MoneyData): void => saveValue(STORAGE_KEYS.money, data);

export const loadCalendarEvents = (): CalendarEvent[] =>
  loadValue(STORAGE_KEYS.calendar, createDemoCalendar, isCalendarData);
export const saveCalendarEvents = (events: CalendarEvent[]): void =>
  saveValue(STORAGE_KEYS.calendar, events);
