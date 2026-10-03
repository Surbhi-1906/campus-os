import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: React.ReactNode;
  color?: 'default' | 'warning' | 'success' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = 'default' }) => {
  const colorClasses = {
    default: 'text-cream',
    warning: 'text-butter',
    success: 'text-green-400',
    danger: 'text-red-400',
  };

  const borderColorClasses = {
    default: 'border-beige/20',
    warning: 'border-butter/30',
    success: 'border-green-400/30',
    danger: 'border-red-400/30',
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`stat-card border ${borderColorClasses[color]}`}
    >
      {icon && <div className="mb-3">{icon}</div>}
      <motion.div
        key={value}
        initial={{ opacity: 0.65, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`number-display mb-2 text-4xl font-bold md:text-5xl ${colorClasses[color]}`}
      >
        {value}
      </motion.div>
      <div className="text-cream font-medium text-lg mb-1">{title}</div>
      <div className="text-beige text-sm">"{subtitle}"</div>
    </motion.div>
  );
};

const TodaySection: React.FC = () => {
  const statCards = [
    {
      title: 'PRIORITIES',
      value: '03',
      subtitle: 'things need you',
      color: 'default' as const,
    },
    {
      title: 'ATTENDANCE',
      value: '71%',
      subtitle: 'needs attention',
      color: 'warning' as const,
    },
    {
      title: 'DEADLINES',
      value: '18h',
      subtitle: 'next one',
      color: 'warning' as const,
    },
    {
      title: 'MONEY',
      value: '₹1,240',
      subtitle: 'left this month',
      color: 'default' as const,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">TODAY</h2>
          <p className="text-beige">Your daily snapshot at a glance</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="accent-button-outline text-sm px-4 py-2"
        >
          VIEW DETAILS
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + index * 0.1 }}
          >
            <StatCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              color={card.color}
            />
          </motion.div>
        ))}
      </div>

      {/* Additional context */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mt-12 pt-8 border-t border-beige/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6">
            <h3 className="text-cream font-semibold mb-3">Coming Up</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span className="text-beige">Maths Practical</span>
                <span className="text-butter font-medium">10:00 AM</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-beige">AWS Project</span>
                <span className="text-butter font-medium">Due Sunday</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-beige">Library Books</span>
                <span className="text-butter font-medium">Overdue</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-cream font-semibold mb-3">Focus Zone</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-beige">Current Session</span>
                <span className="text-butter">45:00</span>
              </div>
              <div className="w-full bg-chocolate/60 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-butter"
                  initial={{ width: '0%' }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 1.5 }}
                />
              </div>
            </div>
            <button className="accent-button-outline w-full text-sm py-2">
              START FOCUS SESSION
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-cream font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-chocolate/30 hover:bg-chocolate/50 transition-colors text-sm">
                <span className="text-cream">Add new deadline</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-chocolate/30 hover:bg-chocolate/50 transition-colors text-sm">
                <span className="text-cream">Log attendance</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-chocolate/30 hover:bg-chocolate/50 transition-colors text-sm">
                <span className="text-cream">Check budget</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default TodaySection;