// Deterministic parser for brain dump text
// No AI, no external APIs - just pattern matching and heuristics

export interface ParsedTask {
  id: string;
  title: string;
  category: 'ACADEMICS' | 'PROJECT' | 'CLUB' | 'PERSONAL' | 'OTHER';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedEffort: number; // in minutes
  deadline?: string;
  priority: 'DO THIS NOW' | 'DO THIS NEXT' | 'CAN WAIT';
  reason: string;
  rawText: string;
}

export interface CopilotPlan {
  chaosLevel: number;
  tasks: ParsedTask[];
  summary: string;
  generatedAt: string;
}

// Category detection patterns
const CATEGORY_PATTERNS = {
  ACADEMICS: ['math', 'maths', 'exam', 'practical', 'assignment', 'homework', 'class', 'lecture', 'study', 'lab', 'quiz', 'test'],
  PROJECT: ['project', 'aws', 'coding', 'programming', 'code', 'software', 'app', 'application', 'build'],
  CLUB: ['club', 'meeting', 'event', 'social', 'activity', 'extracurricular', 'team'],
  PERSONAL: ['personal', 'health', 'gym', 'exercise', 'food', 'sleep', 'rest', 'break'],
  OTHER: [] // catch-all
};

// Urgency keywords
const URGENCY_KEYWORDS = {
  HIGH: ['urgent', 'due tomorrow', 'due today', 'asap', 'immediate', 'critical', 'deadline', 'overdue', 'haven\'t started', 'not started'],
  MEDIUM: ['due soon', 'next week', 'upcoming', 'need to', 'should', 'important'],
  LOW: ['whenever', 'sometime', 'no rush', 'flexible', 'optional']
};

// Time estimation patterns (in minutes)
const EFFORT_PATTERNS = [
  { pattern: /(\d+)\s*(?:hour|hr)/i, multiplier: 60 },
  { pattern: /(\d+)\s*(?:minute|min)/i, multiplier: 1 },
  { pattern: /(\d+)\s*h/i, multiplier: 60 },
  { pattern: /(\d+)\s*m/i, multiplier: 1 }
];

// Deadline patterns
const DEADLINE_PATTERNS = [
  { pattern: /(?:due|deadline|by|tomorrow)\s+(\w+\s+\d+[a-z]{0,2}\s*(?:at)?\s*\d{1,2}[:.]?\d{0,2}\s*(?:am|pm)?)/i, extractor: (match: string) => match },
  { pattern: /(?:due|deadline|by)\s+(?:on\s+)?(\w+day)/i, extractor: (match: string) => match },
  { pattern: /(\d{1,2}[:.]\d{2}\s*(?:am|pm)?)\s+(?:tomorrow|today)/i, extractor: (match: string) => `Tomorrow ${match}` },
  { pattern: /tomorrow/i, extractor: () => 'Tomorrow' },
  { pattern: /today/i, extractor: () => 'Today' },
  { pattern: /next\s+(\w+day)/i, extractor: (match: string) => `Next ${match}` },
];

export const parseBrainDump = (text: string): CopilotPlan => {
  const lines = text.split(/[.,;]\s+/).filter(line => line.trim().length > 0);
  const parsedTasks: ParsedTask[] = [];
  
  // Parse each line as a potential task
  lines.forEach((line, index) => {
    const task = parseTaskLine(line.trim(), index);
    if (task) {
      parsedTasks.push(task);
    }
  });
  
  // If we couldn't parse structured tasks, treat the whole text as one task
  if (parsedTasks.length === 0 && text.trim().length > 0) {
    parsedTasks.push(parseTaskLine(text.trim(), 0) || createFallbackTask(text));
  }
  
  // Prioritize tasks
  const prioritizedTasks = prioritizeTasks(parsedTasks);
  
  // Calculate chaos level
  const chaosLevel = calculateChaosLevel(prioritizedTasks);
  
  // Generate summary
  const summary = generateSummary(prioritizedTasks);
  
  return {
    chaosLevel,
    tasks: prioritizedTasks,
    summary,
    generatedAt: new Date().toISOString()
  };
};

const parseTaskLine = (line: string, index: number): ParsedTask | null => {
  if (line.length < 3) return null;
  
  // Extract title (first part of the line)
  let title = line;
  const lowerLine = line.toLowerCase();
  
  // Try to find a cleaner title by removing time/date references
  for (const pattern of DEADLINE_PATTERNS) {
    const match = line.match(pattern.pattern);
    if (match) {
      title = line.replace(match[0], '').trim();
      break;
    }
  }
  
  // Clean up title
  title = title.replace(/\s+/g, ' ').trim();
  if (title.endsWith('.')) title = title.slice(0, -1);
  
  // Determine category
  const category = determineCategory(lowerLine);
  
  // Determine urgency
  const urgency = determineUrgency(lowerLine);
  
  // Estimate effort
  const estimatedEffort = estimateEffort(lowerLine);
  
  // Extract deadline
  const deadline = extractDeadline(line);
  
  // Create task with temporary priority (will be prioritized later)
  return {
    id: `task-${index}-${Date.now()}`,
    title: title || `Task ${index + 1}`,
    category,
    urgency,
    estimatedEffort,
    deadline,
    priority: 'CAN WAIT', // Will be updated in prioritizeTasks
    reason: '',
    rawText: line
  };
};

const createFallbackTask = (text: string): ParsedTask => {
  const words = text.split(' ').slice(0, 5).join(' ');
  return {
    id: `task-fallback-${Date.now()}`,
    title: words + (text.length > 20 ? '...' : ''),
    category: 'OTHER',
    urgency: 'MEDIUM',
    estimatedEffort: 60,
    deadline: undefined,
    priority: 'CAN WAIT',
    reason: 'General task',
    rawText: text
  };
};

const determineCategory = (text: string): ParsedTask['category'] => {
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        return category as ParsedTask['category'];
      }
    }
  }
  return 'OTHER';
};

const determineUrgency = (text: string): ParsedTask['urgency'] => {
  for (const [urgency, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return urgency as ParsedTask['urgency'];
      }
    }
  }
  
  // Fallback based on deadline mentions
  if (text.includes('tomorrow') || text.includes('today')) {
    return 'HIGH';
  }
  if (text.includes('week') || text.includes('soon')) {
    return 'MEDIUM';
  }
  
  return 'LOW';
};

const estimateEffort = (text: string): number => {
  for (const { pattern, multiplier } of EFFORT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (!isNaN(value)) {
        return value * multiplier;
      }
    }
  }
  
  // Default estimates based on urgency
  return 60; // 1 hour default
};

const extractDeadline = (text: string): string | undefined => {
  for (const { pattern, extractor } of DEADLINE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      try {
        return extractor(match[1] || match[0]);
      } catch {
        return match[0];
      }
    }
  }
  return undefined;
};

const prioritizeTasks = (tasks: ParsedTask[]): ParsedTask[] => {
  // Score each task based on urgency and other factors
  const scoredTasks = tasks.map(task => {
    let score = 0;
    
    // Urgency score
    if (task.urgency === 'HIGH') score += 30;
    else if (task.urgency === 'MEDIUM') score += 15;
    else score += 5;
    
    // Deadline score
    if (task.deadline?.includes('Today') || task.deadline?.includes('tomorrow')) score += 25;
    else if (task.deadline?.includes('Tomorrow')) score += 20;
    else if (task.deadline) score += 10;
    
    // Category score (academics and projects get priority)
    if (task.category === 'ACADEMICS') score += 20;
    else if (task.category === 'PROJECT') score += 15;
    else if (task.category === 'CLUB') score += 10;
    
    // Effort score (shorter tasks get slight preference)
    if (task.estimatedEffort <= 30) score += 5;
    
    return { ...task, score };
  });
  
  // Sort by score (descending)
  scoredTasks.sort((a, b) => b.score - a.score);
  
  // Assign priorities based on position
  return scoredTasks.map((task, index) => {
    let priority: ParsedTask['priority'];
    let reason = '';
    
    if (index === 0) {
      priority = 'DO THIS NOW';
      reason = 'Most urgent item';
    } else if (index < Math.min(3, scoredTasks.length)) {
      priority = 'DO THIS NOW';
      reason = 'High priority';
    } else if (index < Math.min(6, scoredTasks.length)) {
      priority = 'DO THIS NEXT';
      reason = 'Medium priority';
    } else {
      priority = 'CAN WAIT';
      reason = 'Lower priority';
    }
    
    // Add specific reasons based on task characteristics
    if (!reason) {
      if (task.deadline?.includes('Today') || task.deadline?.includes('tomorrow')) {
        reason = 'Closest deadline';
      } else if (task.urgency === 'HIGH') {
        reason = 'High urgency';
      } else if (task.category === 'ACADEMICS') {
        reason = 'Academic priority';
      } else {
        reason = 'General task';
      }
    }
    
    return { ...task, priority, reason };
  });
};

const calculateChaosLevel = (tasks: ParsedTask[]): number => {
  if (tasks.length === 0) return 0;
  
  let chaos = 0;
  
  // Base chaos from number of tasks
  chaos += Math.min(tasks.length * 10, 40);
  
  // Urgency chaos
  const highUrgencyCount = tasks.filter(t => t.urgency === 'HIGH').length;
  chaos += Math.min(highUrgencyCount * 15, 30);
  
  // Deadline chaos
  const imminentDeadlines = tasks.filter(t => 
    t.deadline?.includes('Today') || t.deadline?.includes('tomorrow') || t.deadline?.includes('Tomorrow')
  ).length;
  chaos += Math.min(imminentDeadlines * 12, 25);
  
  // Workload chaos
  const totalEffort = tasks.reduce((sum, t) => sum + t.estimatedEffort, 0);
  chaos += Math.min(totalEffort / 60, 20); // 1 point per hour, max 20
  
  // Overdue indicators
  const overdueIndicators = tasks.filter(t => 
    t.rawText.toLowerCase().includes('overdue') || 
    t.rawText.toLowerCase().includes('haven\'t started') ||
    t.rawText.toLowerCase().includes('not started')
  ).length;
  chaos += Math.min(overdueIndicators * 8, 15);
  
  return Math.min(Math.round(chaos), 100);
};

const generateSummary = (tasks: ParsedTask[]): string => {
  if (tasks.length === 0) {
    return 'No tasks identified. Try being more specific about what you need to do.';
  }
  
  const highPriority = tasks.filter(t => t.priority === 'DO THIS NOW');
  const mediumPriority = tasks.filter(t => t.priority === 'DO THIS NEXT');
  
  if (highPriority.length >= 3) {
    return `You've got ${highPriority.length} urgent things competing for attention. Start with "${highPriority[0].title}", then tackle "${highPriority[1].title}".`;
  }
  
  if (highPriority.length === 2) {
    return `Two urgent priorities: "${highPriority[0].title}" and "${highPriority[1].title}". Focus on the first, then move to the second.`;
  }
  
  if (highPriority.length === 1) {
    if (mediumPriority.length > 0) {
      return `Start with "${highPriority[0].title}", then use remaining time for "${mediumPriority[0].title}".`;
    }
    return `Focus on "${highPriority[0].title}" first. One thing at a time.`;
  }
  
  if (mediumPriority.length > 0) {
    return `You've got ${tasks.length} things to handle. Start with "${mediumPriority[0].title}" and work through the list.`;
  }
  
  return `You've identified ${tasks.length} tasks. Work through them at a steady pace.`;
};

// Load/save from localStorage
export const loadPlanFromStorage = (): CopilotPlan | null => {
  try {
    const saved = localStorage.getItem('campus-os-copilot-plan');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load plan from storage:', error);
  }
  return null;
};

export const savePlanToStorage = (plan: CopilotPlan): void => {
  try {
    localStorage.setItem('campus-os-copilot-plan', JSON.stringify(plan));
  } catch (error) {
    console.error('Failed to save plan to storage:', error);
  }
};

// Demo brain dump
export const DEMO_BRAIN_DUMP = `Maths practical tomorrow at 11:30. Electronics exam Monday. AWS project due Sunday. C assignment needs submission. Club meeting Sunday evening. I haven't started most of this.`;