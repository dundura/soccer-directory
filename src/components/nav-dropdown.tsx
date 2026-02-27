"use client";

import { useState, useRef, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  desc?: string;
  icon?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface NavDropdownProps {
  label: string;
  items?: NavItem[];
  sections?: NavSection[];
  wide?: boolean;
}

export function NavDropdown({ label, items, sections, wide }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simple flat items
  if (items && !sections) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
        >
          {label}
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-border py-2 min-w-[180px] z-50">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-primary hover:bg-surface transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Sectioned dropdown
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
      >
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className={`absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-border z-50 ${wide ? "p-3 min-w-[380px] grid grid-cols-2 gap-3" : "py-2 min-w-[200px]"}`}>
          {sections?.map((section, si) => (
            <div key={si} className={wide ? "" : `${si > 0 ? "border-t border-border mt-1 pt-1" : ""}`}>
              {section.title && (
                <p className={`text-[10px] font-bold uppercase tracking-wider text-gray-400 ${wide ? "px-2 pb-1.5" : "px-4 py-1.5"}`}>
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 text-sm font-medium text-primary hover:bg-surface transition-colors rounded-lg ${wide ? "px-2 py-2" : "px-4 py-2"}`}
                >
                  {item.icon && <span className="text-base w-6 text-center shrink-0">{item.icon}</span>}
                  <div className="min-w-0">
                    <span className="block font-semibold text-[13px]">{item.label}</span>
                    {item.desc && <span className="block text-[11px] text-muted leading-tight">{item.desc}</span>}
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
