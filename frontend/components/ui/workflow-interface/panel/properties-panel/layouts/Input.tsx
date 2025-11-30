import React, { useRef } from "react";

export default function InputProperties({
  label,
  ...props
}: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <button
        className="bg-input/30 flex w-full px-1 py-1 gap-1 items-center relative overflow-hidden rounded-xs justify-center cursor-pointer z-0 text-xxs"
        onClick={handleClick}
      >
        {label}
      </button>
      <input
      className="hidden"
        ref={inputRef}
        {...props}
      />
    </div>
  );
}
