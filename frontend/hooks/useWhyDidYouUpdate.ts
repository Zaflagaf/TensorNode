import { useEffect, useRef } from "react";

export function useWhyDidYouUpdate(
  name: string,
  props: Record<string, any>,
  onlyIf: boolean = true
) {
  const previousProps = useRef(props);

  useEffect(() => {
    if (!onlyIf) return;

    const allKeys = Object.keys({ ...previousProps.current, ...props });
    const changesObj: Record<string, { from: any; to: any }> = {};

    allKeys.forEach((key) => {
      if (previousProps.current[key] !== props[key]) {
        changesObj[key] = {
          from: previousProps.current[key],
          to: props[key],
        };
      }
    });

    if (Object.keys(changesObj).length > 0) {
      console.log(`[why-did-you-update] ${name}`, changesObj);
    }

    previousProps.current = props;
  });
}
