import React from 'react';
import { motion } from 'framer-motion';
import { ParsedTask } from '../utils/copilotParser';

interface TaskCardProps {
  task: ParsedTask;
  priorityGroup: 'DO THIS NOW' | 'DO THIS NEXT' | 'CAN WAIT';
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, priorityGroup, index }) => {
  // Get color based on priority group
  const getPriorityColor = () => {
    switch (priorityGroup) {
      case 'DO THIS NOW':
        return {
          bg: 'bg-butter/10',
          border: 'border-butter/40',
          text: 'text-butter',
          icon: '!'
        };
      case 'DO THIS NEXT':
        return {
          bg: 'bg-beige/10',
          border: 'border-beige/30',
          text: 'text-beige',
          icon: '→'
        };
      case 'CAN WAIT':
        return {
          bg: 'bg-beige/5',
          border: 'border-beige/20',
          text: 'text-beige/70',
          icon: '·'
        };
    }
  };

  // Get urgency color
  const getUrgencyColor = () => {
    switch (task.urgency) {
      case 'HIGH':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      case 'MEDIUM':
        return 'bg-butter/10 text-butter border-butter/25';
      case 'LOW':
        return 'bg-white/[0.04] text-beige border-white/10';
    }
  };

  // Get category color
  const getCategoryColor = () => {
    switch (task.category) {
      case 'ACADEMICS':
        return 'bg-butter/[0.08] text-butter border-butter/20';
      case 'PROJECT':
        return 'bg-white/[0.06] text-cream border-white/15';
      case 'CLUB':
        return 'bg-white/[0.04] text-beige border-white/10';
      case 'PERSONAL':
        return 'bg-butter/[0.06] text-butter/80 border-butter/15';
      case 'OTHER':
        return 'bg-beige/20 text-beige border-beige/30';
    }
  };

  const priorityColors = getPriorityColor();
  const delay = 0.1 + (index * 0.05);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, rotateX: 1, rotateY: -0.5, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`glass-card border p-6 ${priorityColors.border} ${priorityColors.bg} transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${priorityColors.bg} ${priorityColors.border} border`}>
            <span className="text-lg">{priorityColors.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-cream">{task.title}</h3>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor()}`}>
                {task.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor()}`}>
                {task.urgency} PRIORITY
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {task.deadline && (
            <div className="text-butter font-semibold text-sm mb-1">
              {task.deadline}
            </div>
          )}
          <div className="text-beige text-sm">
            ~{task.estimatedEffort} min
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <div className="text-beige text-sm mb-2">Why this order:</div>
        <div className="text-cream font-medium bg-chocolate/30 rounded-lg px-4 py-3 border border-beige/10">
          "{task.reason}"
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between pt-4 border-t border-beige/10">
        <div className="text-xs text-beige">
          <span className="font-medium">Extracted from:</span> "{task.rawText.length > 50 ? task.rawText.substring(0, 50) + '...' : task.rawText}"
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${priorityGroup === 'DO THIS NOW' ? 'bg-butter' : priorityGroup === 'DO THIS NEXT' ? 'bg-beige' : 'bg-beige/50'}`}></div>
            <span className={`text-xs font-medium ${priorityColors.text}`}>
              {priorityGroup}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;