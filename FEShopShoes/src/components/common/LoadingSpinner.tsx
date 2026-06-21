
import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#E2E8F0] rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#0F172A] rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="font-bold uppercase tracking-widest text-xs italic">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
