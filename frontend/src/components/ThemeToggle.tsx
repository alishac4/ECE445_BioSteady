import * as React from 'react';
import { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference saved
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="theme-toggle-wrapper">
      <label className="theme-switch">
        <input
          type="checkbox"
          checked={isDark}
          onChange={toggleTheme}
        />
        <span className="slider">
          <svg className="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" fill="#ffd43b" stroke="#ffd43b"/>
            <path d="M12 2v2m0 16v2M4 12H2m20 0h-2m-2.95-7.05l-1.41 1.41M6.36 17.64l-1.41 1.41m0-12.728l1.41 1.41m11.32 11.318l1.41 1.41" 
                  stroke="#ffd43b" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <svg className="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                  fill="#f1c40f" stroke="#f1c40f" strokeWidth="2"/>
          </svg>
        </span>
      </label>
      <style>{`
        .theme-toggle-wrapper {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .theme-switch {
          position: relative;
          display: inline-block;
          width: 64px;
          height: 34px;
        }

        .theme-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #f0f0f0;
          transition: .4s;
          border-radius: 34px;
          display: flex;
          align-items: center;
          padding: 0 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .sun-icon, .moon-icon {
          position: absolute;
          width: 20px;
          height: 20px;
          transition: .4s;
          z-index: 1;
        }

        .sun-icon {
          left: 8px;
          opacity: 1;
        }

        .moon-icon {
          right: 8px;
          opacity: 0;
        }

        input:checked + .slider {
          background-color: #2c3e50;
        }

        input:checked + .slider:before {
          transform: translateX(30px);
        }

        input:checked + .slider .sun-icon {
          opacity: 0;
        }

        input:checked + .slider .moon-icon {
          opacity: 1;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #2c3e50;
        }

        /* Hover effect */
        .theme-switch:hover .slider:before {
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
        }

        /* Dark mode adjustments */
        .dark .slider {
          background-color: #2c3e50;
        }

        .dark .slider:before {
          background-color: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default ThemeToggle; 