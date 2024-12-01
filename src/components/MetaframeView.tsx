import React, { ComponentType, useEffect, useRef } from "react";

export const MetaframeView: React.FC<{
  id: string;
  iframe: HTMLIFrameElement;
  ErrorWrapper: ComponentType<{ error: string }>;
  style?: any;
}> = ({ id, iframe, style, ErrorWrapper }) => {
  // Initialize useRef with an initial value of `null`
  const iframeContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iframeContainer.current) {
      // now mounted, can freely modify the DOM:
      if (iframe && iframe instanceof Node) {
        if (style && style.maxHeight) {
          iframe.style.maxHeight = style.maxHeight;
        }
        (iframeContainer.current! as Node).appendChild(iframe);
      }
    }
  }, [iframeContainer.current, iframe, style]);

  if (!id) {
    return <ErrorWrapper error="Metaframe class is missing id prop" />;
  }
  if (!iframe) {
    return <ErrorWrapper error={`Missing iframe for ${id}`} />;
  }
  if (!(iframe instanceof Node)) {
    return <ErrorWrapper error={`iframe is not a Node`} />;
  }

  // Optionally show a warning instead of the metaframe if missing required configuration
  const warning = iframe ? null : (
    <ErrorWrapper error={`Missing iframe for ${id}`} />
  );
  return (
    <div ref={iframeContainer} className="iframe-container" style={style}>
      {" "}
      {warning}{" "}
    </div>
  );
};
