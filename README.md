
# @metapages/hash-query

Get/set URL parameters in the hash string instead of the query string.

- Includes react hooks for getting/setting typed values.
- Includes low level tools for getting/setting arbitrary typed values.
  - Includes base64 encoding/decoding of JSON objects, booleans, numbers, etc.

## Usage

Install the package:
```sh
npm i @metapages/hash-query
```

Use the hook in your component:

```typescript
import { useHashParamJson } from "@metapages/hash-query";

...

const [jsonBlob, setJsonBlob] = useHashParamJson<Thing>("key", defaultValue);
```


Use the low level tools for getting/setting arbitrary typed values:

```typescript
import {
  getHashParamValueJsonFromWindow,
  setHashParamValueJsonInWindow,
} from "@metapages/hash-query";

const jsonBlob = getHashParamValueJsonFromWindow<Thing>("key");
setHashParamValueJsonInWindow("key", jsonBlob);
```

## How it works


The hash part of the URL (everything after `#`) is split into the `<hash value>` part and the `key=val` query parts of the hash parameter:

```
https://<origin><path><?querystring>#<hash value>?hashkey1=hashvaue1&hashkey2=hashvaue2...
```


## Examples

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


## Exported functions

```sh
# Base Functions
blobToBase64String
blobFromBase64String
stringToBase64String
stringFromBase64String
getUrlHashParams
getUrlHashParamsFromHashString
getHashParamValue
getHashParamFromWindow
getHashParamsFromWindow
setHashParamInWindow
setHashParamValueInHashString
setHashParamValueInUrl
deleteHashParamFromWindow
deleteHashParamFromUrl
# JSON Functions
setHashParamValueJsonInUrl
getHashParamValueJsonFromUrl
setHashParamValueJsonInWindow
getHashParamValueJsonFromWindow
setHashParamValueJsonInHashString
# Float Functions
setHashParamValueFloatInUrl
getHashParamValueFloatFromUrl
setHashParamValueFloatInWindow
getHashParamValueFloatFromWindow
# Integer Functions
setHashParamValueIntInUrl
getHashParamValueIntFromUrl
setHashParamValueIntInWindow
getHashParamValueIntFromWindow
# Boolean Functions
setHashParamValueBooleanInUrl
getHashParamValueBooleanFromUrl
setHashParamValueBooleanInWindow
getHashParamValueBooleanFromWindow
# Base64 Functions
setHashParamValueBase64EncodedInUrl
getHashParamValueBase64DecodedFromUrl
setHashParamValueBase64EncodedInWindow
getHashParamValueBase64DecodedFromWindow
```
