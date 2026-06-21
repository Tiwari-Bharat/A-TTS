import React, { useState, useRef, useEffect } from "react";
import { VoiceOption } from "../types";

interface VoiceSelectProps {
  label: string;
  options: VoiceOption[];
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  onPlaySample: (voiceId: string) => void;
  playingSampleVoiceId: string | null;
}

const VoiceSelect: React.FC<VoiceSelectProps> = ({
  label,
  options,
  value,
  onChange,
  disabled,
  onPlaySample,
  playingSampleVoiceId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-300 mb-2 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all shadow-inner ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-slate-600"
          }`}
        >
          <span className="truncate">
            {selectedOption?.label || "Select..."}
          </span>
          <svg
            className={`w-5 h-5 text-violet-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-auto">
            <ul className="p-1 space-y-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    value === option.value
                      ? "bg-violet-900/40 text-violet-300"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  onClick={(e) => {
                    if (
                      (e.target as HTMLElement).closest(
                        "button.play-sample-btn",
                      )
                    )
                      return;
                    onChange({ target: { value: option.value } });
                    setIsOpen(false);
                  }}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-medium text-sm">{option.label}</span>
                    <span
                      className="text-xs text-slate-500 truncate"
                      title={option.description}
                    >
                      {option.description}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="play-sample-btn shrink-0 p-1.5 ml-2 text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 rounded-md transition-colors border border-violet-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySample(option.value);
                    }}
                    title="Play Sample"
                  >
                    {playingSampleVoiceId === option.value ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSelect;
