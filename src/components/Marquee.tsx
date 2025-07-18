import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({ 
  children, 
  className = "", 
  reverse = false, 
  pauseOnHover = false 
}) => {
  return (
    <div className={`flex overflow-hidden ${className} ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}>
      <div className={`flex animate-marquee ${reverse ? 'animate-marquee2' : ''}`}>
        {children}
      </div>
      <div className={`flex animate-marquee ${reverse ? 'animate-marquee2' : ''}`} aria-hidden="true">
        {children}
      </div>
    </div>
  );
};

export default Marquee;