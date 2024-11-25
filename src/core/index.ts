/**
 * Core logic for getting/setting hash params
 * Important note: the internal hash string does NOT have the leading #
 */

import stringify from "fast-json-stable-stringify";

export type SetHashParamOpts = {
  modifyHistory?: boolean;
};

export const blobToBase64String = (blob: Record<string, any>) => {
  return stringToBase64String(stringify(blob));
};

export const blobFromBase64String = (value: string | undefined) => {
  if (value && value.length > 0) {
    const blob = JSON.parse(stringFromBase64String(value));
    return blob;
  }
  return undefined;
};

export const stringToBase64String = (value: string) :string => {
  return btoa(encodeURIComponent(value));
};

export const stringFromBase64String = (value: string) :string => {
  return decodeURIComponent(atob(value));
};

// Get everything after # then after ?
export const getUrlHashParams = (
  url: string
): [string, Record<string, string>] => {
  const urlBlob = new URL(url);
  return getUrlHashParamsFromHashString(urlBlob.hash);
};

export const getUrlHashParamsFromHashString = (
  hash: string
): [string, Record<string, string>] => {
  let hashString = hash;
  while (hashString.startsWith("#")) {
    hashString = hashString.substring(1);
  }

  const queryIndex = hashString.indexOf("?");
  if (queryIndex === -1) {
    return [hashString, {}];
  }
  const preHashString = hashString.substring(0, queryIndex);
  hashString = hashString.substring(queryIndex + 1);
  const hashObject: Record<string, string> = {};
  hashString
    .split("&")
    .filter((s) => s.length > 0)
    .map((s) => {
      const dividerIndex = s.indexOf("=");
      if (dividerIndex === -1) {
        return [s, ""];
      }
      const key = s.substring(0, dividerIndex);
      const value = s.substring(dividerIndex + 1);
      return [key, value];
    })
    .forEach(([key, value]) => {
      hashObject[key] = value;
    });

  Object.keys(hashObject).forEach((key) => {
    try {
      hashObject[key] = decodeURI(hashObject[key]);
    } catch (ignored) {
      hashObject[key] = hashObject[key];
    }
  });
  return [preHashString, hashObject];
};

export const getHashParamValue = (
  url: string,
  key: string
): string | undefined => {
  const [_, hashParams] = getUrlHashParams(url);
  return hashParams[key];
};

export const getHashParamFromWindow = (key: string): string | undefined => {
  return getHashParamsFromWindow()[1][key];
};

export const getHashParamsFromWindow = (): [string, Record<string, string>] => {
  return getUrlHashParams(window.location.href);
};

export const setHashParamInWindow = (
  key: string,
  value: string | undefined,
  opts?: SetHashParamOpts
) => {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.substring(1)
    : window.location.hash;
  const newHash = setHashParamValueInHashString(hash, key, value);
  if (newHash === hash) {
    return;
  }

  if (opts?.modifyHistory) {
    // adds to browser history, so affects back button
    // fires "hashchange" event
    window.location.hash = newHash;
  } else {
    // The following will NOT work to trigger a 'hashchange' event:
    // Replace the state so the back button works correctly
    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}${
        newHash.startsWith("#") ? "" : "#"
      }${newHash}`
    );
    // Manually trigger a hashchange event:
    // I don't know how to add the previous and new url parameters
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
};


// returns hash string
export const setHashParamValueInHashString = (
  hash: string,
  key: string,
  value: string | undefined
) => {
  const [preHashParamString, hashObject] = getUrlHashParamsFromHashString(hash);

  let changed = false;
  if (
    (hashObject.hasOwnProperty(key) && value === null) ||
    value === undefined
  ) {
    delete hashObject[key];
    changed = true;
  } else {
    if (hashObject[key] !== value) {
      hashObject[key] = value;
      changed = true;
    }
  }

  // don't do work if unneeded
  if (!changed) {
    return hash;
  }

  const keys = Object.keys(hashObject);
  keys.sort();
  const hashStringNew = keys
    .map((key, i) => {
      return `${key}=${encodeURI(hashObject[key])}`;
    })
    .join("&");
  // replace after the ? but keep before that
  return `${preHashParamString}?${hashStringNew}`;
};

// returns URL string
export const setHashParamValueInUrl = (
  url: string,
  key: string,
  value: string | undefined
) => {
  const urlBlob = new URL(url);
  const newHash = setHashParamValueInHashString(urlBlob.hash, key, value);
  urlBlob.hash = newHash;
  return urlBlob.href;
};

/* json */

export const setHashParamValueJsonInUrl = <T>(
  url: string,
  key: string,
  value: T | undefined
) :string => {
  const urlBlob = new URL(url);
  urlBlob.hash = setHashParamValueJsonInHashString(urlBlob.hash, key, value);
  return urlBlob.href;
};

export const getHashParamValueJsonFromUrl = <T>(
  url: string,
  key: string
): T | undefined => {
  const valueString = getHashParamValue(url, key);
  if (valueString && valueString !== "") {
    const value = blobFromBase64String(valueString);
    return value;
  }
  return;
};

export const setHashParamValueJsonInWindow =<T>(
  key: string,
  value: T | undefined,
  opts?: SetHashParamOpts
) :void => {
  const valueString = value ? blobToBase64String(value) : undefined;
  setHashParamInWindow(key, valueString, opts);
};

export const getHashParamValueJsonFromWindow = <T>(
  key: string
): T | undefined => {
  return getHashParamValueJsonFromUrl(window.location.href, key);
};

export const setHashParamValueJsonInHashString = <T>(
  hash: string,
  key: string,
  value: T | undefined
) => {
  const valueString = value ? blobToBase64String(value) : undefined;
  return setHashParamValueInHashString(hash, key, valueString);
};

/* float */

export const setHashParamValueFloatInUrl = (
  url: string,
  key: string,
  value: number | undefined
) :string => {
  return setHashParamValueInUrl(url, key, value ? value.toString() : undefined);
};

export const getHashParamValueFloatFromUrl = (
  url: string,
  key: string
): number | undefined => {
  const hashParamString = getHashParamValue(url, key);
  return hashParamString ? parseFloat(hashParamString) : undefined;
};

export const setHashParamValueFloatInWindow = (
  key: string,
  value: number | undefined,
  opts?: SetHashParamOpts
) :void => {
  setHashParamInWindow(key, value !== undefined && value !== null ? value.toString() : undefined, opts);
};

export const getHashParamValueFloatFromWindow = (key: string): number | undefined => {
  return getHashParamValueFloatFromUrl(window.location.href, key);
};

/* integer */

export const setHashParamValueIntInUrl = (
  url: string,
  key: string,
  value: number | undefined
) :string => {
  return setHashParamValueInUrl(url, key, value !== undefined && value !== null ? value.toString() : undefined);
};

export const getHashParamValueIntFromUrl = (
  url: string,
  key: string
): number | undefined => {
  const hashParamString = getHashParamValue(url, key);
  return hashParamString ? parseInt(hashParamString) : undefined;
};

export const setHashParamValueIntInWindow = (
  key: string,
  value: number | undefined,
  opts?: SetHashParamOpts
) :void => {
  setHashParamValueFloatInWindow(key, value, opts);
};

export const getHashParamValueIntFromWindow = (key: string): number | undefined => {
  return getHashParamValueIntFromUrl(window.location.href, key);
};


/* boolean */

export const setHashParamValueBooleanInUrl = (
  url: string,
  key: string,
  value: boolean | undefined
) :string => {
  return setHashParamValueInUrl(url, key, value ? "true" : undefined);
};

export const getHashParamValueBooleanFromUrl = (
  url: string,
  key: string
): boolean | undefined => {
  const hashParamString = getHashParamValue(url, key);
  return hashParamString === "true" ? true : false;
};

export const setHashParamValueBooleanInWindow = (
  key: string,
  value: boolean | undefined,
  opts?: SetHashParamOpts
) :void => {
  setHashParamInWindow(key, value ? "true" : undefined, opts);
};

export const getHashParamValueBooleanFromWindow = (key: string): boolean | undefined => {
  return getHashParamValueBooleanFromUrl(window.location.href, key);
};


/* HashValueBase64 */

export const setHashParamValueBase64EncodedInUrl = (
  url: string,
  key: string,
  value: string | undefined
) :string => {
  return setHashParamValueInUrl(url, key,
    value === null || value === undefined ? undefined : stringToBase64String(value));
};

export const getHashParamValueBase64DecodedFromUrl = (
  url: string,
  key: string
): string | undefined => {
  const valueString = getHashParamValue(url, key);
  return valueString && valueString !== "" ? stringFromBase64String(valueString) : undefined;
};

export const setHashParamValueBase64EncodedInWindow = (
  key: string,
  value: string | undefined,
  opts?: SetHashParamOpts
) :void => {
  const encodedValue = value === null || value === undefined ? undefined : stringToBase64String(value);
  setHashParamInWindow(key, encodedValue, opts);
};

export const getHashParamValueBase64DecodedFromWindow = (
  key: string
): string | undefined => {
  return getHashParamValueBase64DecodedFromUrl(window.location.href, key);
};

export const deleteHashParamFromWindow = (
  key: string,
  opts?: SetHashParamOpts
): void => {
  setHashParamInWindow(key, undefined, opts);
};

export const deleteHashParamFromUrl = (
  url: string,
  key: string
): string => {
  return setHashParamValueInUrl(url, key, undefined);
};

