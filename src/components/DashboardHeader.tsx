import React from 'react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ eyebrow, title, description }) => (
  <motion.header
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative mb-8 border-b border-white/[0.06] pb-6 md:mb-10 md:pb-8"
  >
    <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] text-butter sm:text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-butter shadow-[0_0_12px_rgba(200,241,105,0.8)]" />
      {eyebrow}
    </p>
    <h2 className="mb-3 font-display text-4xl font-bold tracking-[-0.055em] text-cream sm:text-5xl">
      {title}
    </h2>
    <p className="max-w-2xl text-base leading-relaxed text-beige sm:text-lg">{description}</p>
  </motion.header>
);

export default DashboardHeader;
