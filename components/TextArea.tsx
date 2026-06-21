import React, { forwardRef } from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={props.id || "textarea"}
            className="block text-sm font-medium text-slate-300 mb-2 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          <textarea
            ref={ref}
            id={props.id || "textarea"}
            className="w-full h-40 p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all custom-scrollbar shadow-inner group-hover:border-slate-600"
            {...props}
          ></textarea>
          {/* Subtle inner highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none rounded-t-xl"></div>
        </div>
        <p className="text-right text-xs font-mono text-slate-500 mt-2">
          {String(props.value || "").length} characters
        </p>
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
