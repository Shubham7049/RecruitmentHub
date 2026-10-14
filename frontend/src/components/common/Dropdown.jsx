import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";

export const Dropdown = ({
  trigger,
  items = [],
  align = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/5 border border-slate-100 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1 border-t border-slate-100" />;
            }

            const Icon = item.icon;

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors",
                  item.danger
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
