import { useRef } from "react";

const useId = (prefix = "id") => {
  const ref = useRef<string | null>(null);
  if (ref.current === null) {
    ref.current = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return ref.current;
}

export default useId