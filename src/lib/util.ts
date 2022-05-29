import stringify from "fast-json-stable-stringify";

export type SetHashParamOpts = {
  modifyHistory?: boolean;
};

export const isIframe = (): boolean => {
  //http://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
  try {
    return window !== window.top;
  } catch (ignored) {
    return false;
  }
};

export const blobToBase64String = (blob: Record<string, any>) => {
  return btoa(stringify(blob));
};

export const blobFromBase64String = (
  value: string | undefined
) => {
  if (value && value.length > 0) {
    const blob = JSON.parse(atob(value));
    return blob;
  }
  return undefined;
};

export const getHashParamsInWindow = (): [string, Record<string, string>] => {
  return getUrlHashParams(window.location.href);
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
  // console.log(`getUrlHashParamsFromHashString queryIndex=${queryIndex} hash=${hash} hash=${hashString}`)
  if (queryIndex === -1) {
    return [hashString, {}];
  }
  const preHashString = hashString.substring(0, queryIndex);
  hashString = hashString.substring(queryIndex + 1);
  // hashString = hashString.replace("#?")
  // @ts-ignore
  const hashObject = Object.fromEntries(
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
  );
  Object.keys(hashObject).forEach(
    (key) => (hashObject[key] = decodeURI(hashObject[key]))
  );
  // console.log([preHashString, hashObject])
  return [preHashString, hashObject];
};

export const getHashParamValue = (
  url: string,
  key: string
): string | undefined => {
  const [_, hashParams] = getUrlHashParams(url);
  return hashParams[key];
};

export const getHashParamValueJson = (
  url: string,
  key: string
): any | undefined => {
  const valueString = getHashParamValue(url, key);
  if (valueString && valueString !== "") {
    const value = blobFromBase64String(valueString);
    return value;
  }
  return;
};

export const setHashParamInWindow = (
  key: string,
  value: string | undefined,
  opts?: SetHashParamOpts
) => {
  const hash = window.location.hash;
  const newHash = setHashValueInHashString(hash, key, value);
  // console.log('newHash', newHash);
  // console.log(`setHashParamInWindow key=${key} value=${value} hash=${hash} newHash=${newHash}`);
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
      `${window.location.pathname}${window.location.search}${newHash.startsWith("#") ? "" : "#"}${newHash}`
    );
    // Manually trigger a hashchange event:
    // I don't know how to add the previous and new url parameters
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
};

export const setHashParamJsonInWindow = (
  key: string,
  value: object | undefined,
  opts?: SetHashParamOpts
) => {
  const valueString = value ? blobToBase64String(value) : undefined;
  setHashParamInWindow(key, valueString, opts);
};

// returns hash string
export const setHashValueInHashString = (
  hash: string,
  key: string,
  value: string | undefined
) => {
  // console.log(`setHashValueInHashString 1 preHashParamString=${hash} key=${key} value=${value}`);
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

  // console.log(`setHashValueInHashString 3 preHashParamString=${preHashParamString} hashObject=${JSON.stringify(hashObject)}  `);

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

export const setHashValueJsonInHashString = (
  hash: string,
  key: string,
  value: object | undefined
) => {
  const valueString = value ? blobToBase64String(value) : undefined;
  return setHashValueInHashString(hash, key, valueString);
};

// returns URL string
export const setHashValueInUrl = (
  url: string,
  key: string,
  value: string | undefined
) => {
  const urlBlob = new URL(url);
  const newHash = setHashValueInHashString(urlBlob.hash, key, value);
  urlBlob.hash = newHash;
  // console.log('urlBlob.hash', urlBlob.hash);
  return urlBlob.href;
};

// returns URL string
export const setHashValueJsonInUrl = (
  url: string,
  key: string,
  value: object | undefined
) => {
  const urlBlob = new URL(url);
  urlBlob.hash = setHashValueJsonInHashString(urlBlob.hash, key, value);
  return urlBlob.href;
};
