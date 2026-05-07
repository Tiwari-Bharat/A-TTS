import React from 'react';

const Header: React.FC = () => (
  <header className="text-center pt-8 pb-4">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
      </span>
      Advanced AI Voices
    </div>
    <h1 
      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white mb-4 leading-tight"
    >
      Speak with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-teal-300">Confidence.</span>
    </h1>
    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-sans leading-relaxed">
      Transform your text into lifelike, expressive speech using cutting-edge AI models. Create voiceovers, translations, and more.
    </p>
  </header>
);

export default Header;