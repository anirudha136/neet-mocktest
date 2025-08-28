import { useEffect, useState } from "react";

export default function Timer({ duration, onTimeUp }: { duration: number; onTimeUp: () => void }) {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    if (time <= 0) {
      onTimeUp();
      return;
    }
    const interval = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [time, onTimeUp]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const isUrgent = time <= 300; // 5 minutes or less

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
      isUrgent 
        ? "bg-red-500 text-white shadow-lg animate-pulse" 
        : "bg-gray-900 text-white shadow-sm"
    }`}>
      <span className="font-mono">
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </span>
      {isUrgent && <span className="text-xs">⚠️</span>}
    </div>
  );
}
