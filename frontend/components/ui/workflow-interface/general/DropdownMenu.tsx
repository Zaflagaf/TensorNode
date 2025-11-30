"use client";

import { useEffect, useRef, useState } from "react";

interface DropdownMenuProps {
  children: React.ReactNode; // le trigger
  menuItems: { name: string; onClick: () => void }[]; // items du menu
}

export default function DropdownMenu({
  children,
  menuItems,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      <div onClick={() => setIsOpen((prev) => !prev)}>{children}</div>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-40 bg-popover border border-border shadow-md  rounded-xs z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="px-2 py-1 text-xxs hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
