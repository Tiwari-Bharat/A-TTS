import React, { useEffect } from "react";

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["Ctrl", "/"], description: "Toggle this hotkeys guide" },
  { keys: ["Esc"], description: "Close this hotkeys guide" },
  { keys: ["Enter"], description: "Generate speech from text" },
  { keys: ["Space"], description: "Play or stop the generated audio" },
  { keys: ["D"], description: "Download the generated audio" },
  { keys: ["V"], description: "Cycle through available voices" },
  { keys: ["S"], description: "Cycle through playback speeds" },
  { keys: ["E"], description: "Cycle through sound effects" },
];

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-300 bg-slate-800 border border-slate-600 rounded-md shadow-[0_2px_0_theme(colors.slate.600)]">
    {children}
  </kbd>
);

const HotkeysModal: React.FC<HotkeysModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-30"></div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-200 tracking-wide uppercase">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-lg border border-slate-700 hover:border-slate-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          {shortcuts.map(({ keys, description }, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-slate-300 text-sm"
            >
              <span className="text-slate-400">{description}</span>
              <div className="flex items-center gap-1.5">
                {keys.map((key, i) => (
                  <React.Fragment key={key}>
                    <Kbd>{key}</Kbd>
                    {i < keys.length - 1 && (
                      <span className="text-slate-600 px-0.5 text-xs">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotkeysModal;
