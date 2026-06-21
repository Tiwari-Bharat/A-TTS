import React, { useRef } from "react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (time: number) => {
  if (isNaN(time) || time === 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const seekRatio = Math.max(0, Math.min(1, clickX / width));
    onSeek(seekRatio * duration);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-slate-400 font-mono w-10 text-right">
        {formatTime(currentTime)}
      </span>
      <div
        ref={progressBarRef}
        onClick={handleSeek}
        className="w-full h-2.5 bg-slate-900/80 rounded-full cursor-pointer group shadow-inner border border-slate-800 relative overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-300 rounded-full relative transition-all duration-100 ease-linear shadow-[0_0_10px_theme(colors.violet.400/50%)]"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 ease-out z-10"></div>
        </div>
      </div>
      <span className="text-xs text-slate-400 font-mono w-10 text-left">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;
