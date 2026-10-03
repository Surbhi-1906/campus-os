import React from 'react';
import { motion } from 'framer-motion';
import { CopilotPlan as CopilotPlanType } from '../utils/copilotParser';
import TaskCard from './TaskCard';
import BrandWordmark from './BrandWordmark';

interface CopilotPlanProps {
  plan: CopilotPlanType;
  onReplan: () => void;
  onEditPlan: () => void;
  onStartFocusMode: () => void;
}

const CopilotPlan: React.FC<CopilotPlanProps> = ({
  plan,
  onReplan,
  onEditPlan,
  onStartFocusMode
}) => {
  const getChaosLevelColor = (level: number) => {
    if (level >= 80) return 'text-red-400';
    if (level >= 60) return 'text-butter';
    if (level >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getChaosLevelText = (level: number) => {
    if (level >= 80) return 'High chaos';
    if (level >= 60) return 'Moderate chaos';
    if (level >= 40) return 'Manageable';
    return 'Under control';
  };

  // Group tasks by priority
  const doThisNowTasks = plan.tasks.filter(task => task.priority === 'DO THIS NOW');
  const doThisNextTasks = plan.tasks.filter(task => task.priority === 'DO THIS NEXT');
  const canWaitTasks = plan.tasks.filter(task => task.priority === 'CAN WAIT');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <BrandWordmark size="md" />
          <div className="text-sm text-beige">
            Plan generated {new Date(plan.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4"
        >
          HERE'S THE MOVE.
        </motion.h2>
      </div>

      {/* Chaos Level */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 mb-8 border-butter/30 border"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">CHAOS LEVEL</h3>
            <div className="flex items-center space-x-4">
              <div className={`text-5xl font-bold ${getChaosLevelColor(plan.chaosLevel)}`}>
                {plan.chaosLevel} / 100
              </div>
              <div className="text-beige">
                {getChaosLevelText(plan.chaosLevel)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="w-64 bg-chocolate/60 h-3 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-butter/80 to-butter"
                initial={{ width: '0%' }}
                animate={{ width: `${plan.chaosLevel}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs text-beige mt-2">
              <span>Calm</span>
              <span>Moderate</span>
              <span>Chaotic</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Smart Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 mb-10 border-beige/20 border"
      >
        <h3 className="text-xl font-semibold mb-4 text-butter">THE MOVE</h3>
        <p className="text-lg text-cream leading-relaxed">
          {plan.summary}
        </p>
      </motion.div>

      {/* Prioritized Tasks */}
      <div className="space-y-10">
        {/* DO THIS NOW */}
        {doThisNowTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-3 h-8 bg-butter rounded-full mr-4"></div>
              <h3 className="text-2xl font-display font-bold">DO THIS NOW</h3>
              <span className="ml-4 px-3 py-1 bg-butter/20 text-butter text-sm rounded-full">
                {doThisNowTasks.length} task{doThisNowTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {doThisNowTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} priorityGroup="DO THIS NOW" index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* DO THIS NEXT */}
        {doThisNextTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-3 h-8 bg-beige/60 rounded-full mr-4"></div>
              <h3 className="text-2xl font-display font-bold text-beige">DO THIS NEXT</h3>
              <span className="ml-4 px-3 py-1 bg-beige/20 text-beige text-sm rounded-full">
                {doThisNextTasks.length} task{doThisNextTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {doThisNextTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} priorityGroup="DO THIS NEXT" index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* CAN WAIT */}
        {canWaitTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-3 h-8 bg-beige/30 rounded-full mr-4"></div>
              <h3 className="text-2xl font-display font-bold text-beige/70">CAN WAIT</h3>
              <span className="ml-4 px-3 py-1 bg-beige/10 text-beige/70 text-sm rounded-full">
                {canWaitTasks.length} task{canWaitTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {canWaitTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} priorityGroup="CAN WAIT" index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-12 pt-8 border-t border-beige/10"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartFocusMode}
            className="accent-button flex-1 flex items-center justify-center space-x-3 py-4"
          >
            <span className="font-bold text-lg">START FOCUS MODE</span>
            <span className="text-xl">→</span>
          </motion.button>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReplan}
              className="accent-button-outline flex-1 py-4"
            >
              REPLAN
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEditPlan}
              className="accent-button-outline flex-1 py-4"
            >
              EDIT PLAN
            </motion.button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-beige text-sm">
          <p>Focus mode will navigate to the FOCUS section with this plan loaded.</p>
          <p className="mt-1">REPLAN clears current plan and returns to brain dump.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CopilotPlan;