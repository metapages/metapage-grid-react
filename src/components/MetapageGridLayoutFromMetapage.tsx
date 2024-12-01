import React, {
  ComponentType,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Layout } from 'react-grid-layout';

import {
  Metapage,
  MetapageDefinitionV1,
  MetapageEventDefinition,
  MetapageEvents,
  MetapageInstanceInputs,
} from '@metapages/metapage';

import { MetaframeIframe } from '@metapages/metapage-react';
import {
  DEFAULT_ROW_HEIGHT,
  ResizingGridLayout,
} from './MetapageGridLayoutFromDefinition.js';

/**
 * Create a grid layout metapage from a metapage object
 */

export const MetapageGridLayoutFromMetapage: React.FC<{
  metapage?: Metapage;
  inputs?: MetapageInstanceInputs;
  onOutputs?: (outputs: MetapageInstanceInputs) => void;
  onDefinition?: (e: MetapageDefinitionV1) => void;
  Wrapper?: ComponentType<any>;
  ErrorWrapper?: ComponentType<any>;
}> = ({ metapage, inputs, onOutputs, onDefinition, Wrapper, ErrorWrapper }) => {
  const definitionRef = useRef<{
    definition: MetapageDefinitionV1;
    hash?: string;
  }>();
  const [definitionInternal, setDefinitionInternal] = useState<
  MetapageDefinitionV1 | undefined
  >();
  const [metapageInternal, setMetapageInternal] = useState<
    Metapage | undefined
  >();
  const [error, setError] = useState<any | undefined>();

  useEffect(() => {
    setMetapageInternal(metapage);
    setDefinitionInternal(
      metapage && !metapage.isDisposed() ? metapage.getDefinition() : undefined
    );
  }, [metapage, setMetapageInternal, setDefinitionInternal]);

  // listeners: metapage events
  useEffect(() => {
    if (!metapageInternal) {
      return;
    }
    const disposers: (() => void)[] = [];
    disposers.push(
      metapageInternal.addListenerReturnDisposer(MetapageEvents.Error, setError)
    );
    if (onOutputs) {
      disposers.push(
        metapageInternal.addListenerReturnDisposer(
          MetapageEvents.Outputs,
          onOutputs
        )
      );
    }
    if (onDefinition) {
      disposers.push(
        metapageInternal.addListenerReturnDisposer(
          MetapageEvents.Definition,
          (e: MetapageEventDefinition) => {
            // Update the local definitionRef that is authoritative on what
            // is actually running, so incoming updates don't unnecessarily
            // clobber (and cause ugly re-renders)
            // This update comes from internal metaframe URL updates, so there's
            // no need to trigger a re-render
            definitionRef.current = { definition: e.definition };
            onDefinition(e.definition);
          }
        )
      );
    }

    return () => {
      while (disposers.length > 0) {
        const disposer = disposers.pop();
        if (disposer) {
          disposer();
        }
      }
    };
  }, [metapageInternal, onOutputs, onDefinition, setError]);

  // listeners: inputs
  useEffect(() => {
    if (metapageInternal && !metapageInternal.isDisposed() && inputs) {
      metapageInternal.setInputs(inputs);
    }
  }, [metapageInternal, inputs]);

  const defaultLayout = !metapageInternal
    ? []
    : Object.keys(metapageInternal.getMetaframes()).map((metaframeId, i) => {
        return {
          i: metaframeId,
          x: i % 2 === 0 ? 0 : 6,
          y: Math.floor(i / 2),
          w: 6,
          h: 2,
        };
      });

  const rowHeight =
    (metapageInternal &&
      definitionInternal?.meta?.layouts?.["react-grid-layout"]?.props
        ?.rowHeight) ||
    DEFAULT_ROW_HEIGHT;
  const containerPadding = (metapageInternal &&
    definitionInternal?.meta?.layouts?.["react-grid-layout"]?.props
      ?.containerPadding) || [5, 5];
  const cols =
    (metapageInternal &&
      definitionInternal?.meta?.layouts?.["react-grid-layout"]?.props?.cols) ||
    12;
  const margin = (metapageInternal &&
    definitionInternal?.meta?.layouts?.["react-grid-layout"]?.props
      ?.margin) || [10, 20];
  let layout =
    metapageInternal &&
    definitionInternal?.meta?.layouts?.["react-grid-layout"]?.layout
      ? [...definitionInternal?.meta?.layouts?.["react-grid-layout"]?.layout]
      : defaultLayout;
  const onLayoutChange = useCallback(
    (layout: Layout[]) => {
      if (!onDefinition || !definitionInternal) {
        return;
      }

      // The passed in definition could be immutable, so we need to clone it
      const newDefinition: MetapageDefinitionV1 = JSON.parse(
        JSON.stringify(definitionInternal)
      );
      newDefinition.meta = newDefinition.meta || {};
      newDefinition.meta.layouts = newDefinition.meta.layouts || {};

      const reactGridLayout = {
        docs: "https://www.npmjs.com/package/react-grid-layout",
        props: {
          cols,
          margin,
          rowHeight,
          containerPadding,
        },
        layout,
      };
      newDefinition.meta.layouts["react-grid-layout"] = reactGridLayout;
      onDefinition(newDefinition);
    },
    [onDefinition, definitionInternal]
  );

  if (error) {
    if (ErrorWrapper) {
      return <ErrorWrapper error={error} />;
    } else {
      return <div>Error: {`${error}`}</div>;
    }
  }

  return (
    <ResizingGridLayout
      layout={layout}
      // isBounded={grid.bounded}
      isDraggable={true}
      isResizable={true}
      className="layout"
      cols={cols}
      containerPadding={containerPadding}
      // rowHeight={grid.rowHeight}
      rowHeight={rowHeight}
      margin={margin}
      onLayoutChange={onLayoutChange}
      // onResizeStop={resizeStop}
      // onDragStop={onDragStop}
      // draggableHandle=".widget-drag-handle"
    >
      {!metapageInternal
        ? []
        : Object.keys(metapageInternal.getMetaframes()).map((metaframeId, i) =>
            Wrapper ? (
              <Wrapper key={metaframeId}>
                <MetaframeIframe
                  key={metaframeId}
                  metaframe={metapageInternal.getMetaframes()[metaframeId]}
                  style={{
                    height: `100%`,
                    overflow: "clip", // instead of "scroll"
                  }}
                />
              </Wrapper>
            ) : (
              <MetaframeIframe
                key={metaframeId}
                style={{
                  height: `100%`,
                  overflow: "clip", // instead of "scroll"
                }}
                metaframe={metapageInternal.getMetaframes()[metaframeId]}
              />
            )
          )}
    </ResizingGridLayout>
  );
};
