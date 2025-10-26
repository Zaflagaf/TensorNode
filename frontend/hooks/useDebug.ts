"use client";

// (import) bibliotheques externes
import { useEffect } from "react";

const useDebug = (callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    callback();
  }, deps);
};

export default useDebug;
