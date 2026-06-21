import React from "react";
import Spinner from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingMessage?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  loadingMessage = "Processing...",
  icon,
  className,
  ...props
}) => {
  return (
    <button
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
        props.disabled || isLoading
          ? "bg-slate-800 text-slate-400 cursor-not-allowed shadow-none border border-slate-700"
          : "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.violet.500/40%)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:ring-violet-400 border border-transparent"
      } ${className}`}
      disabled={props.disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {/* Glossy overlay effect for non-disabled state */}
      {!(props.disabled || isLoading) && (
        <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none"></span>
      )}

      {isLoading ? (
        <>
          <Spinner />
          <span className="ml-2 relative z-10 tracking-wide">
            {loadingMessage}
          </span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2 relative z-10">{icon}</span>}
          <span className="relative z-10 tracking-wide">{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
