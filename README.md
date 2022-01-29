
# @metapages/hash-query

Useful hooks and tools for getting/setting:
  - typed simple and complex parameters
  - into the URL hash parameters


The hash part of the URL (everything after `#`) is split into the `<hash value>` part and the `key=val` query parts of the hash parameter:

```
https://<origin><path><?querystring>#<hash value>?hashkey1=hashvaue1&hashkey2=hashvaue2...
```

## Installation

```sh
npm i @metapages/hash-query
```

## Examples

### JSON

Get and set a JSON blob in the url hash query:

```typescript

import {
  useHashParamJson
} from "@metapages/hash-query";

type Blob = {
  foo:string;
}

export const App: FunctionalComponent = () => {

  // the hook handles all the encoding/decoding/listening
  const [jsonBlob, setJsonBlob] =
    useHashParamJson<Blob>("key", defaultValue);

  // respond to new inputs
  useEffect(() => {
    console.log(`I got a new jsonBlob ${JSON.stringify(jsonBlob)}`);
  }, [jsonBlob]);


  // Just render the blob
  return <div> {JSON.stringify(jsonBlob)} </div>
}

```

### Other types:

```typescript

import {
useHashParam,
useHashParamBase64,
useHashParamBoolean,
useHashParamFloat,
useHashParamInt,
useHashParamJson,
} from "@metapages/hash-query";

```

Usage is the same as the JSON example above (get/set value)

## API and utils for direct manipulation

Low level tools and utils for getting/setting arbitrary typed values in the URL hash string or manipulating the hash string without having to actually set the URL:


```typescript
import {
  blobToBase64String,
  blobFromBase64String,
  getHashParamsInWindow,
  getHashParamValue,
  getUrlHashParams,
  getUrlHashParamsFromHashString,
  setHashParamInWindow,
  setHashParamJsonInWindow,
  setHashValueInHashString,
  setHashValueInUrl,
  setHashValueJsonInHashString,
  setHashValueJsonInUrl,

} from "@metapages/hash-query";

const foo :{key:string} = { key: "bar" };
const fooEncoded :string = blobToBase64String(foo);
const [ hashValue, hashParams ] = getHashParamsInWindow();
// Equivalent to above:
const [ hashValue, hashParams ] = getUrlHashParams(window.location.href);
// Equivalent to above:
const [ hashValue, hashParams ] = getUrlHashParamsFromHashString(window.location.hash);
// url: https://example.com/#?foo=bar
// value === "string"
const value:string = getHashParamValue(window.location.href, "foo");
// url then === https://example.com/#?foo=newbar
setHashParamInWindow("foo", "newbar");
// url then === https://example.com/#?foo=<base64encoded JSON>
setHashParamJsonInWindow("foo", foo);
// hash === "#?x=y&foo=<base64encoded JSON>"
const hash:string = setHashValueInHashString("#?x=y&foo=<base64encoded JSON>", "foo", foo);
// url then === https://example.com/#?x=y&foo=bar
const url:string = setHashValueInUrl("#?x=y&foo=<base64encoded JSON>", "foo", "bar");
// url then === https://example.com/#?x=y&foo=<base64encoded JSON>
const url:string = setHashValueJsonInUrl("#?x=y&foo=bar", "foo", {something:"new"});

```
