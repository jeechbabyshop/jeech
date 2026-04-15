import React from 'react';

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Large Bubbles */}
      <div className="absolute top-10 left-5 w-20 h-20 bg-pink-300/20 rounded-full animate-float blur-sm"></div>
      <div className="absolute top-20 right-10 w-28 h-28 bg-purple-300/15 rounded-full animate-float-delay-1 blur-sm"></div>
      <div className="absolute bottom-10 left-1/4 w-36 h-36 bg-pink-400/10 rounded-full animate-float-delay-2 blur-md"></div>
      <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-purple-400/20 rounded-full animate-float-delay-3 blur-sm"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-300/25 rounded-full animate-float-delay-4 blur-sm"></div>
      <div className="absolute top-1/2 left-10 w-32 h-32 bg-purple-300/15 rounded-full animate-float-delay-5 blur-md"></div>
      <div className="absolute bottom-1/3 right-20 w-16 h-16 bg-pink-400/20 rounded-full animate-float-delay-6 blur-sm"></div>
      <div className="absolute top-10 right-1/4 w-44 h-44 bg-purple-400/5 rounded-full animate-float-delay-7 blur-lg"></div>
      
      {/* Small Bubbles */}
      <div className="absolute top-40 left-1/3 w-8 h-8 bg-pink-300/30 rounded-full animate-float-slow blur-sm"></div>
      <div className="absolute bottom-40 right-1/2 w-10 h-10 bg-purple-300/25 rounded-full animate-float-slow blur-sm"></div>
      <div className="absolute top-60 left-10 w-6 h-6 bg-pink-400/30 rounded-full animate-float-slow blur-sm"></div>
      <div className="absolute bottom-60 right-20 w-12 h-12 bg-purple-400/20 rounded-full animate-float-slow blur-sm"></div>
      
      {/* Stars */}
      <div className="absolute top-15 left-20 text-yellow-400/30 animate-twinkle text-2xl">⭐</div>
      <div className="absolute top-40 right-40 text-yellow-400/25 animate-twinkle-delay-1 text-xl">⭐</div>
      <div className="absolute bottom-30 left-1/2 text-yellow-400/20 animate-twinkle-delay-2 text-3xl">⭐</div>
      <div className="absolute top-1/2 right-20 text-yellow-400/30 animate-twinkle-delay-3 text-2xl">⭐</div>
      <div className="absolute bottom-20 right-1/3 text-yellow-400/25 animate-twinkle-delay-4 text-xl">⭐</div>
      <div className="absolute top-60 left-1/3 text-yellow-400/20 animate-twinkle-delay-5 text-3xl">⭐</div>
      <div className="absolute bottom-40 right-60 text-yellow-400/30 animate-twinkle-delay-6 text-2xl">⭐</div>
      <div className="absolute top-80 right-10 text-yellow-400/25 animate-twinkle-delay-7 text-xl">⭐</div>
      <div className="absolute top-20 left-1/2 text-yellow-400/20 animate-twinkle-delay-8 text-2xl">⭐</div>
      <div className="absolute bottom-10 left-10 text-yellow-400/30 animate-twinkle-delay-9 text-xl">⭐</div>
      <div className="absolute top-1/3 left-1/4 text-yellow-400/20 animate-twinkle-fast text-2xl">⭐</div>
      <div className="absolute bottom-1/2 right-1/3 text-yellow-400/25 animate-twinkle-fast text-xl">⭐</div>
      
      {/* Small decorative dots */}
      <div className="absolute top-30 right-1/4 w-1.5 h-1.5 bg-pink-400/40 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-50 left-1/3 w-2 h-2 bg-purple-400/40 rounded-full animate-pulse-slow-delay"></div>
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-pink-300/40 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-70 right-20 w-2.5 h-2.5 bg-purple-400/30 rounded-full animate-pulse-slow-delay"></div>
      <div className="absolute bottom-30 right-1/4 w-1.5 h-1.5 bg-pink-400/35 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-50 left-20 w-2 h-2 bg-purple-300/30 rounded-full animate-pulse-slow-delay"></div>
    </div>
  );
};

export default BackgroundEffects;