import { useCallback, useEffect, useState } from "react";
import {
  getHashParamFromWindow,
  getHashParamsFromWindow,
  setHashParamInWindow,
  SetHashParamOpts,
} from "./util";

/**
 * Hook for getting/setting hash params
 */
export const useHashParam = (
  key: string,
  defaultValue?: string
): [
  string | undefined,
  (v: string | undefined, opts?: SetHashParamOpts) => void
] => {
  const [hashParam, setHashParamInternal] = useState<string | undefined>(
    getHashParamFromWindow(key) ?? defaultValue
  );

  useEffect(() => {
    const onHashChange = (_: HashChangeEvent) => {
      const paramHash = getHashParamsFromWindow()[1];
      setHashParamInternal(paramHash[key]);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setParam: (v: string | undefined) => void = useCallback(
    (value: string | undefined, opts?: SetHashParamOpts) => {
      setHashParamInWindow(key, value, opts);
    },
    []
  );

  return [hashParam, setParam];
};
