"use client";

// (import) bibliotheques externes
import { useLayoutEffect } from "react";

const useOnInit = (callback: () => void) => {
  useLayoutEffect(() => {
    callback();
  }, []);
};

export default useOnInit;
