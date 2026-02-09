import { ReactNode } from 'react';

interface FeedBackgroundProps {
  children: ReactNode;
}

export default function FeedBackground({ children }: FeedBackgroundProps) {
  return (
    <div className="relative min-h-screen">
      {/* Background image layer */}
      <div 
        className="fixed inset-0 feed-background-image"
        style={{
          backgroundImage: 'url(/assets/WhatsApp%20Image%202026-02-09%20at%208.24.07%20PM.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      {/* Overlay for readability */}
      <div 
        className="fixed inset-0 feed-background-overlay"
        style={{
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      
      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
