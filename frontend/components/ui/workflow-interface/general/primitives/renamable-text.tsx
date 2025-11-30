"use client";

import * as React from "react";
import { Input } from "@/frontend/components/ui/shadcn/input";

interface RenamableTextProps {
  value: string;
  onChange: (newValue: string) => void;
}

export const RenamableText: React.FC<RenamableTextProps> = ({ value, onChange }) => {
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(value);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus sur l'input quand on passe en édition
  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    onChange(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setText(value);
      setEditing(false);
    }
  };

  return editing ? (
    <Input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full text-xxs"
    />
  ) : (
    <span
      onClick={() => setEditing(true)}
      className="cursor-text hover:bg-gray-100 px-1 rounded text-xxs"
    >
      {value}
    </span>
  );
};