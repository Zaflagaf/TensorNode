"use client";

import { cn } from "@/frontend/lib/utils";
import React, { ChangeEvent, useEffect, useState } from "react";

type NumberSetter =
  | React.Dispatch<React.SetStateAction<number>>
  | ((value: number) => void);

interface WorkflowNumberProps {
  number: number;
  setNumber: NumberSetter;
  label: string;
  type?: "int" | "float"; // nouveau
}

const WorkflowNumber: React.FC<WorkflowNumberProps> = React.memo(
  ({ number, setNumber, label, type = "int" }) => {
    const [focus, setFocus] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(String(number ?? 0));

    // Quand le `number` change de l’extérieur, mettre à jour l’input
    useEffect(() => {
      setInputValue(String(number ?? 0));
    }, [number]);

    // Gestion du clavier
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "ArrowLeft",
        "ArrowRight",
        "Delete",
        "Tab",
        "Enter",
      ];
      if (allowedKeys.includes(e.key)) return;

      // Autoriser chiffres
      if (e.key >= "0" && e.key <= "9") return;

      // Autoriser le point seulement si float et pas déjà présent
      if (
        type === "float" &&
        e.key === "." &&
        !e.currentTarget.value.includes(".")
      )
        return;

      // Bloquer tout le reste (y compris les virgules)
      e.preventDefault();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Empêcher caractères invalides
      if (type === "int" && /[^0-9\-]/.test(value)) return;
      if (type === "float" && /[^0-9.\-]/.test(value)) return;

      setInputValue(value);

      // Convertir en nombre si possible
      const numericValue = type === "int" ? parseInt(value) : parseFloat(value);
      if (!isNaN(numericValue)) setNumber(numericValue);
    };

    return (
      <div
        className={cn(
          "bg-card-foreground/5 rounded-[4px] py-[4px] px-[8px] gap-[5px] flex text-muted-foreground hover:text-foreground text-xs focus-within:bg-card-foreground/20 w-full"
        )}
      >
        <p className={cn("w-fit whitespace-nowrap", focus ? "hidden" : "flex")}>
          {label}:
        </p>
        <input
          type="text"
          value={inputValue} // <-- IMPORTANT: utiliser inputValue ici
          onFocus={(e) => {
            setFocus(true);
            (e.target as HTMLInputElement).select();
          }}
          onBlur={() => setFocus(false)}
          onChange={handleChange}
          onKeyDown={(e) => {
            handleKeyDown(e);
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className={cn(
            "flex w-full h-full outline-none appearance-none undraggable",
            focus ? "text-start" : "text-end"
          )}
        />
      </div>
    );
  }
);

WorkflowNumber.displayName = "WorkflowNumber";
export default WorkflowNumber;
