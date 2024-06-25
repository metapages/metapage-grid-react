import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useHashParam } from './useHashParam';
import { SetHashParamOpts } from './util';

/**
 * Hook for getting/setting a hash param boolean (safely encoded)
 */
export const useHashParamBoolean = (
  key: string,
  defaultValue?: boolean
): [
  boolean | undefined,
  (v: boolean | undefined, opts?: SetHashParamOpts) => void
] => {
  const [hashParamString, setHashParamString] = useHashParam(key);
  const [hashBoolean, setHashBoolean] = useState<boolean>(!!defaultValue);

  // if the hash string value changes
  useEffect(() => {
    setHashBoolean(hashParamString === "true");
  }, [defaultValue, key, hashParamString, setHashBoolean]);

  const setBoolean = useCallback(
    (val: boolean | undefined, opts?: SetHashParamOpts) => {
      val = !!val;
      if (val === !!defaultValue) {
        setHashParamString(undefined, opts);
      } else {
        setHashParamString(defaultValue ? "false" : "true", opts);
      }
    },
    [defaultValue, setHashParamString]
  );

  return [hashBoolean, setBoolean];
};
