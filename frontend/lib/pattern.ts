import { ChangeEvent } from "react";

/**
 * Format numeric input:
 * - Allows digits
 * - Comma as decimal separator
 * - Leading '-' toggled
 * - Scientific notation with e/E and optional +/- exponent
 */
export function formatNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
  let value = e.target.value;
  const lastChar = (e.nativeEvent as InputEvent).data || "";

  // --- Find 'e' position ---
  const idxE = value.search(/[eE]/);
  let mantissa = idxE === -1 ? value : value.slice(0, idxE);
  let exponent = idxE === -1 ? "" : value.slice(idxE + 1);
  const eChar = idxE === -1 ? "" : value[idxE];

  // --- Leading minus toggle (only for mantissa) ---
  let sign = "";
  if (mantissa.startsWith("-")) {
    sign = "-";
    mantissa = mantissa.slice(1);
  }

  // Only toggle leading minus if the last typed '-' is **not immediately after 'e'**
  const lastTypedIndex = value.length - 1;
  const isAfterE = idxE !== -1 && lastTypedIndex === idxE + 1;
  if (lastChar === "-" && !isAfterE) {
    sign = sign === "-" ? "" : "-";
  }

  // Remove stray minus in mantissa
  mantissa = mantissa.replace(/-/g, "");

  // --- Clean mantissa ---
  const lastComma = mantissa.lastIndexOf(",");
  if (lastComma !== -1) {
    mantissa =
      mantissa.slice(0, lastComma).replace(/,/g, "") +
      mantissa.slice(lastComma);
  }
  mantissa = mantissa.replace(/[^0-9,]/g, "");

  // --- Clean exponent ---
  if (exponent.length > 0) {
    const firstChar = exponent[0];
    if (firstChar === "+" || firstChar === "-") {
      exponent = firstChar + exponent.slice(1).replace(/[^0-9]/g, "");
    } else {
      exponent = exponent.replace(/[^0-9]/g, "");
    }
  }

  // --- Recombine ---
  value = sign + mantissa + eChar + exponent;

  return value;
}
