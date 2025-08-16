"use client";
import React from "react";

type Section = {
  id: string;
  label: string;
};

interface NavigationMenuProps {
  sections: Section[];
  activeSection: string;
  onChange: (id: string) => void;
}

export default function NavigationMenu({
  sections,
  activeSection,
  onChange,
}: NavigationMenuProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg px-3 py-3 flex gap-2 justify-between">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`flex-1 px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap
            ${
              activeSection === s.id
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm"
            }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
