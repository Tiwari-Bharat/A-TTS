import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 relative z-10 w-full pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6"></div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            &copy; {currentYear} Developed by{" "}
            <a
              href="https://my-inf.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-300 hover:text-violet-400 transition-colors uppercase text-xs"
            >
              Bharat Tiwari
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
