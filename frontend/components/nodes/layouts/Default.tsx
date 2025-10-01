"use client";

import React from "react";

const WorkflowDefault = React.memo(
  ({
    label,
  }: {
    label: string;
  }) => {
    return (
      <p className="text-node-text text-xs px-[2px] py-[4px]">{label}</p>

      /*       <div className="flex items-center gap-2 mx-2 px-2 py-1.5 bg-slate-50 rounded-md border border-slate-200 hover:border-slate-300 transition-colors min-w-0">
        <span className="font-medium text-slate-900 whitespace-nowrap">
          {label}:
        </span>
        <input
          className="flex-1 min-w-0 px-2 py-1 text-right transition-colors bg-white border rounded undraggable border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 hover:border-slate-300"
          type="text"
          defaultValue={number}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const number = Number(e.target.value);
            if (!isNaN(number)) setNumber(number);
          }}
        />
      </div> */
    );
  }
);
export default WorkflowDefault;
