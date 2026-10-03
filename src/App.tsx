import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import CopilotSection from './components/CopilotSection';
import TodaySection from './components/TodaySection';
import PomodoroTimer from './components/PomodoroTimer';
import AcademicsSection from './components/AcademicsSection';
import AttendanceSection from './components/AttendanceSection';
import MoneySection from './components/MoneySection';
import CalendarSection from './components/CalendarSection';
import { loadPlanFromStorage } from './utils/copilotParser';

function App() {
  const [activeSection, setActiveSection] = useState('copilot');

  const handleStartFocusMode = () => {
    // Navigate to FOCUS section
    setActiveSection('focus');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'copilot':
        const hasPlan = loadPlanFromStorage() !== null;
        return (
          <div className="space-y-8">
            <CopilotSection onStartFocusMode={handleStartFocusMode} />
            {!hasPlan && <TodaySection />}
          </div>
        );
      case 'focus':
        return (
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                FOCUS MODE
              </h2>
              <p className="text-xl text-beige mb-8">
                Take your COPILOT plan and focus on one thing at a time.
              </p>
              <div className="glass-card p-8 mb-8 text-left">
                <h3 className="text-2xl font-semibold mb-4 text-butter">Focus Session</h3>
                <p className="text-beige mb-6">
                  Settle in for one focused session at a time. Take a short break when you're done.
                </p>
                <PomodoroTimer />
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-chocolate/40 p-4 rounded-lg">
                    <div className="text-butter font-bold text-2xl mb-2">0/5</div>
                    <div className="text-sm text-beige">Tasks Completed</div>
                  </div>
                  <div className="bg-chocolate/40 p-4 rounded-lg">
                    <div className="text-butter font-bold text-2xl mb-2">100%</div>
                    <div className="text-sm text-beige">Focus Score</div>
                  </div>
                </div>
                <p className="text-sm text-beige">
                  <span className="text-butter font-semibold">Tip:</span> Generate a plan in COPILOT first, then come back here to execute it.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('copilot')}
                className="accent-button"
              >
                BACK TO COPILOT
              </motion.button>
            </motion.div>
          </div>
        );
      case 'academics':
        return <AcademicsSection />;
      case 'attendance':
        return <AttendanceSection />;
      case 'money':
        return <MoneySection />;
      case 'calendar':
        return <CalendarSection />;
      default:
        return (
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                {activeSection.toUpperCase()}
              </h2>
              <p className="text-xl text-beige mb-8">
                Choose a section from the navigation to get started.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('copilot')}
                className="accent-button"
              >
                BACK TO COPILOT
              </motion.button>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-espresso">
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="ambient-orb absolute -left-48 top-20 h-[28rem] w-[28rem] rounded-full bg-butter/[0.055] blur-[100px]" />
        <div className="ambient-orb absolute -right-56 top-[38%] h-[34rem] w-[34rem] rounded-full bg-white/[0.025] blur-[120px]" />
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-butter/20 to-transparent" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />

      <AnimatePresence mode="wait">
        <motion.main
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          {renderSection()}
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/[0.08] py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-display font-bold text-xl mb-2">
                <span className="text-gradient">CAMPUS OS</span>
              </h3>
              <p className="text-beige text-sm">The operating system for college life.</p>
            </div>
            <div className="text-beige text-sm">
              <p>Built for students, by students. 2026.</p>
              <p className="mt-1">Made for the everyday rhythm of campus life.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;