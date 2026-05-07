import React from "react";
import { VoiceOption } from "../types";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: VoiceOption[];
}

const Select: React.FC<SelectProps> = ({ label, options, ...props }) => {
  return (
    <div>
      <label
        htmlFor={props.id || "select"}
        className="block text-sm font-medium text-slate-300 mb-2 tracking-wide"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={props.id || "select"}
          className={`w-full p-3 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all appearance-none shadow-inner ${props.disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-500"}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 0.75rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
            paddingRight: "2.5rem",
          }}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              title={option.description}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Select;
