import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'copilot', label: 'COPILOT' },
    { id: 'academics', label: 'ACADEMICS' },
    { id: 'attendance', label: 'ATTENDANCE' },
    { id: 'money', label: 'MONEY' },
    { id: 'calendar', label: 'CALENDAR' },
    { id: 'focus', label: 'FOCUS' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-espresso/80 py-4 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-8">
            <div className="hidden md:block">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                <span className="text-gradient">CAMPUS OS</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`nav-item ${activeSection === item.id ? 'nav-item-active' : ''}`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="font-medium text-sm tracking-wider">
                    {item.label}
                  </span>
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-butter shadow-[0_0_12px_rgba(200,241,105,0.8)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg border border-white/10 p-2 transition-colors hover:border-butter/25 hover:bg-white/[0.04] md:hidden"
            whileTap={{ scale: 0.92 }}
          >
            <div className="flex h-6 w-6 flex-col justify-center space-y-1">
              <span className={`block w-6 h-0.5 bg-cream transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-cream transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-cream transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 border-t border-beige/10 pt-4"
          >
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-3 px-4 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-butter/10 text-cream border-l-4 border-butter'
                      : 'text-beige hover:text-cream hover:bg-chocolate/30'
                  }`}
                  whileTap={{ scale: 0.985 }}
                >
                  <span className="font-medium text-sm tracking-wider">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;