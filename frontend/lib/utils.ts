import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function invertPair<T extends string>(value: T, pair: [T, T]): T {
  return value === pair[0] ? pair[1] : pair[0];
}