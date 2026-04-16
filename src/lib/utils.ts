import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function wait(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function isOverdue(date: string) {
  return new Date(date).getTime() < Date.now();
}
