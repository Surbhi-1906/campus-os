import React from 'react';

interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const BrandWordmark: React.FC<BrandWordmarkProps> = ({ className = '', size = 'lg' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl md:text-4xl',
    xl: 'text-4xl md:text-5xl',
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center space-x-2">
        <h1 className={`font-display font-bold tracking-[-0.06em] ${sizeClasses[size]}`}>
          <span className="text-gradient">CAMPUS OS</span>
        </h1>
        <span className="rounded-full border border-butter/20 bg-butter/[0.06] px-2 py-1 text-xs font-medium text-butter">
          / 01
        </span>
      </div>
      <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-beige sm:text-xs">
        THE OPERATING SYSTEM FOR COLLEGE LIFE.
      </p>
    </div>
  );
};

export default BrandWordmark;