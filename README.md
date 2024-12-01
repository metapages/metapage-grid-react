
# @metapages/metapage-grid-react

Embed metapages as grids directly in your react apps.

## Installation

Install the package:
```sh
npm i @metapages/metapage-grid-react
```

## React Components

You can directly embed a metapage definition in your react app, and
- pass in inputs
- listen to outputs
- listen to definition changes
- customize the component metaframe wrappers


```typescript

import { MetapageGridLayoutFromDefinition } from '@metapages/metapage-grid-react';
import { getMetapageDefinitionFromUrl } from '@metapages/metapage';

export const MyMetapageDisplay: React.FC = () => {

  const [metapageDefinition, setMetapageDefinition] = useState<MetapageDefinitionV1 | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const definition = await getMetapageDefinitionFromUrl("https://app.metapage.io/dion/example-hello-world-b4dc42b55df94364a1ebac10e8e91f32")
      setMetapageDefinition(definition);
    )());;
  }, []);

  if (!metapageDefinition) {
    return <div>Loading...</div>;
  }

  return (
    <MetapageGridLayoutFromDefinition
      definition={metapageDefinition}
      // definition?: MetapageDefinitionV1;
      // inputs?: MetapageInstanceInputs;
      // onOutputs?: (outputs: MetapageInstanceInputs) => void;
      // onDefinition?: (e: MetapageDefinitionV1) => void;
      // onMetapage?: (m: Metapage) => void;
      // Wrapper?: ComponentType<any>;
      // onMetapageError?: (e: any) => void;
      // ErrorWrapper?: ComponentType<any>;
      // debug?: boolean;
      // disableEditing?: boolean;
    />
  )
}
```
