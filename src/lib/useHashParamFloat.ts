import { useCallback, useEffect, useState } from "react";
import { useHashParam } from "./useHashParam";
import { getHashParamFromWindow, SetHashParamOpts } from "./util";

/**
 * Hook for getting/setting a hash param float (safely encoded)
 */
export const useHashParamFloat = (
  key: string,
  defaultValue?: number
): [
  number | undefined,
  (v: number | undefined, opts?: SetHashParamOpts) => void
] => {
  const [hashParamString, setHashParamString] = useHashParam(
    key,
    defaultValue !== undefined && defaultValue !== null
      ? defaultValue.toString()
      : getHashParamFromWindow(key)
      ? getHashParamFromWindow(key)
      : undefined
  );
  const [hashNumber, setHashNumber] = useState<number | undefined>(
    hashParamString ? parseFloat(hashParamString) : undefined
  );

  // if the hash string value changes
  useEffect(() => {
    setHashNumber(hashParamString ? parseFloat(hashParamString) : undefined);
  }, [key, hashParamString, setHashNumber]);

  const setNumber = useCallback(
    (val: number | undefined, opts?: SetHashParamOpts) => {
      if (val) {
        setHashParamString(val.toString(), opts);
      } else {
        setHashParamString(undefined, opts);
      }
    },
    [setHashParamString]
  );

  return [hashNumber, setNumber];
};
