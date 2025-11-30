"use client";

import { cn } from "@/frontend/lib/utils";
import React, { ChangeEvent, useEffect, useState } from "react";

type StringSetter = React.Dispatch<React.SetStateAction<string>> | ((value: string) => void);

interface WorkflowStringProps {
  value: string;
  setValue: StringSetter;
  label: string;
}

const WorkflowString: React.FC<WorkflowStringProps> = React.memo(
  ({ value, setValue, label }) => {
    const [focus, setFocus] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(value ?? "");

    // Sync quand la valeur change de l’extérieur
    useEffect(() => {
      setInputValue(value ?? "");
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setValue(newValue);
    };

    return (
      <div
        className={cn(
          "bg-muted/75 rounded-xs py-[2px] px-[8px] gap-[5px] flex text-muted-foreground hover:text-foreground focus-within:bg-card-foreground/20 w-full"
        )}
      >
        <p className={cn("w-fit whitespace-nowrap text-xxs", focus ? "hidden" : "flex")}>
          {label}:
        </p>
        <input
          type="text"
          value={inputValue}
          onFocus={(e) => {
            setFocus(true);
            (e.target as HTMLInputElement).select();
          }}
          onBlur={() => setFocus(false)}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className={cn(
            "flex w-full h-full outline-none appearance-none undeletable text-xxs",
            focus ? "text-start" : "text-end"
          )}
        />
      </div>
    );
  }
);

WorkflowString.displayName = "WorkflowString";
export default WorkflowString;
