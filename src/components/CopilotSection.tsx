import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BrandWordmark from './BrandWordmark';
import CopilotPlan from './CopilotPlan';
import { parseBrainDump, savePlanToStorage, loadPlanFromStorage, DEMO_BRAIN_DUMP, CopilotPlan as CopilotPlanType } from '../utils/copilotParser';

interface CopilotSectionProps {
  onStartFocusMode: () => void;
}

const CopilotSection: React.FC<CopilotSectionProps> = ({ onStartFocusMode }) => {
  const [commandInput, setCommandInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<CopilotPlanType | null>(() => loadPlanFromStorage());
  const [isProcessing, setIsProcessing] = useState(false);

  const examplePrompts = [
    "Maths practical tomorrow. AWS project due Sunday.",
    "I have 2 hours and way too much to do.",
    "Can I skip electronics tomorrow?",
  ];

  const quickCommands = [
    { id: 'time', label: 'I HAVE 2 HOURS' },
    { id: 'urgent', label: "WHAT'S URGENT?" },
    { id: 'skip', label: 'CAN I SKIP?' },
    { id: 'afford', label: 'CAN I AFFORD IT?' },
    { id: 'plan', label: 'PLAN MY DAY' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const plan = parseBrainDump(commandInput);
    setCurrentPlan(plan);
    savePlanToStorage(plan);
    setIsProcessing(false);
  };

  const handleTryExample = () => {
    setCommandInput(DEMO_BRAIN_DUMP);
  };

  const handleReplan = () => {
    setCurrentPlan(null);
    setCommandInput('');
  };

  const handleEditPlan = () => {
    if (currentPlan) {
      // Use the raw text from tasks to pre-fill the input
      const rawTexts = currentPlan.tasks.map(task => task.rawText).join('. ');
      setCommandInput(rawTexts);
      setCurrentPlan(null);
    }
  };

  // If we have a plan, show the CopilotPlan component
  if (currentPlan) {
    return (
      <CopilotPlan
        plan={currentPlan}
        onReplan={handleReplan}
        onEditPlan={handleEditPlan}
        onStartFocusMode={onStartFocusMode}
      />
    );
  }

  // Empty state - show brain dump input
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-12 md:px-6 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute right-[-8rem] top-8 hidden h-[34rem] w-[34rem] items-center justify-center md:flex">
          <div className="absolute inset-0 rounded-full border border-butter/[0.09]" />
          <div className="absolute inset-8 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-20 rounded-full border border-butter/[0.08]" />
          <div className="absolute h-64 w-64 rotate-45 rounded-[4rem] border border-butter/15 bg-gradient-to-br from-butter/[0.08] via-white/[0.015] to-transparent shadow-[0_0_90px_rgba(200,241,105,0.07)] backdrop-blur-sm" />
          <div className="absolute right-16 top-14 h-3 w-3 rounded-full bg-butter shadow-[0_0_22px_rgba(200,241,105,0.85)]" />
          <div className="absolute bottom-20 left-16 h-2 w-2 rounded-full bg-cream/70 shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
        </div>
        {/* Small label */}
        <div className="relative mb-9 flex items-center space-x-2">
          <BrandWordmark size="xl" />
        </div>

        {/* Large headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-5 font-display text-5xl font-bold tracking-[-0.065em] sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span className="text-gradient">WHAT'S THE MOVE?</span>
        </motion.h2>

        {/* Supporting copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-10 max-w-xl text-lg leading-relaxed text-beige md:mb-12 md:text-xl"
        >
          Your classes, deadlines, attendance and money are everywhere.
          <br />
          <span className="text-cream font-semibold">Let's get them under control.</span>
        </motion.p>

        {/* Empty state message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card relative mb-8 border border-butter/20 p-6 text-left sm:p-8"
        >
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-butter">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-butter shadow-[0_0_12px_rgba(200,241,105,0.8)]" />
            YOUR COMMAND CENTER IS READY
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">YOUR BRAIN IS LOUD.</h3>
          <p className="mt-2 text-base text-beige sm:text-lg">LET'S SORT IT. ONE THING AT A TIME.</p>
        </motion.div>

        {/* Command Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mb-12"
        >
          <form onSubmit={handleSubmit}>
            <div className={`relative rounded-2xl border bg-white/[0.025] p-2 shadow-2xl transition-all duration-300 ${isInputFocused ? 'scale-[1.005] border-butter/45 shadow-[0_0_44px_rgba(200,241,105,0.09)]' : 'border-white/[0.1]'}`}>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Dump your messy college life here..."
                className="input-field w-full border-0 bg-transparent py-5 pl-4 pr-4 text-base focus:ring-0 sm:py-6 sm:pl-6 sm:pr-40 sm:text-lg"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="accent-button mt-2 flex w-full items-center justify-center space-x-2 px-6 disabled:cursor-not-allowed disabled:opacity-50 sm:absolute sm:bottom-2 sm:right-2 sm:top-2 sm:mt-0 sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <span className="font-bold">PROCESSING</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-espresso border-t-transparent"></div>
                  </>
                ) : (
                  <>
                    <span className="font-bold">ASK COPILOT</span>
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>
            </div>

            {/* Try example button */}
            <div className="mt-6 flex justify-center">
              <motion.button
                type="button"
                onClick={handleTryExample}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-butter hover:text-butter/80 px-5 py-2.5 rounded-full border border-butter/30 hover:border-butter/50 transition-colors flex items-center space-x-2"
              >
                <span>Try an example</span>
                <span className="text-xs">📋</span>
              </motion.button>
            </div>

            {/* Example prompts */}
            <div className="mt-6">
              <h4 className="text-sm uppercase tracking-wider text-beige mb-3">Example brain dumps</h4>
              <div className="flex flex-wrap gap-3">
                {examplePrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => setCommandInput(prompt)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-beige/70 hover:text-beige px-4 py-2 rounded-full border border-beige/20 hover:border-beige/40 transition-colors"
                  >
                    "{prompt}"
                  </motion.button>
                ))}
              </div>
            </div>
          </form>
        </motion.div>

        {/* Quick Commands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-sm uppercase tracking-wider text-beige mb-6">QUICK COMMANDS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickCommands.map((command, index) => (
              <motion.button
                key={command.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="command-button text-center"
                onClick={() => {
                  // Map quick commands to example inputs
                  if (command.id === 'plan') {
                    setCommandInput(DEMO_BRAIN_DUMP);
                  } else if (command.id === 'urgent') {
                    setCommandInput("What's most urgent right now? I have multiple deadlines.");
                  } else if (command.id === 'time') {
                    setCommandInput("I have 2 hours free. What should I work on?");
                  } else if (command.id === 'skip') {
                    setCommandInput("Can I skip electronics class tomorrow? What are the consequences?");
                  } else if (command.id === 'afford') {
                    setCommandInput("Can I afford to eat out this week with my current budget?");
                  }
                }}
              >
                <span className="font-medium tracking-tight">{command.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-xl font-semibold mb-4 text-butter">How COPILOT works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-butter/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-butter text-lg">1</span>
              </div>
              <p className="text-sm text-cream">Type messy college life info</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-butter/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-butter text-lg">2</span>
              </div>
              <p className="text-sm text-cream">We parse tasks locally</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-butter/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-butter text-lg">3</span>
              </div>
              <p className="text-sm text-cream">Get prioritized action plan</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-butter/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-butter text-lg">4</span>
              </div>
              <p className="text-sm text-cream">Focus on what matters first</p>
            </div>
          </div>
        </motion.div>

        {/* Microcopy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap gap-6 justify-center text-beige/60 text-sm"
        >
          <span className="hover:text-beige transition-colors cursor-default">"Let's lock in."</span>
          <span className="hover:text-beige transition-colors cursor-default">"One thing at a time."</span>
          <span className="hover:text-beige transition-colors cursor-default">"Yeah, you've got a lot going on."</span>
          <span className="hover:text-beige transition-colors cursor-default">"Consider it handled."</span>
        </motion.div>
      </div>
    </div>
  );
};

export default CopilotSection;