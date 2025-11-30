import React from "react";

export default function ButtonProperties({
  label,
  ...props
}: { label?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="bg-input/30 flex w-full px-1 py-1 gap-1 items-center relative overflow-hidden rounded-xs justify-center cursor-pointer z-0 text-xxs" {...props}>
      { label && <span className="text-xxs">{label}</span>}
    </button>
  );
}
