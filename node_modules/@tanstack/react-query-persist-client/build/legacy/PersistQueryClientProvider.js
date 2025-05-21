"use client";

// src/PersistQueryClientProvider.tsx
import * as React from "react";
import {
  persistQueryClientRestore,
  persistQueryClientSubscribe
} from "@tanstack/query-persist-client-core";
import { IsRestoringProvider, QueryClientProvider } from "@tanstack/react-query";
import { jsx } from "react/jsx-runtime";
var PersistQueryClientProvider = ({
  children,
  persistOptions,
  onSuccess,
  onError,
  ...props
}) => {
  const [isRestoring, setIsRestoring] = React.useState(true);
  const refs = React.useRef({ persistOptions, onSuccess, onError });
  const didRestore = React.useRef(false);
  React.useEffect(() => {
    refs.current = { persistOptions, onSuccess, onError };
  });
  React.useEffect(() => {
    const options = {
      ...refs.current.persistOptions,
      queryClient: props.client
    };
    if (!didRestore.current) {
      didRestore.current = true;
      persistQueryClientRestore(options).then(() => {
        var _a, _b;
        return (_b = (_a = refs.current).onSuccess) == null ? void 0 : _b.call(_a);
      }).catch(() => {
        var _a, _b;
        return (_b = (_a = refs.current).onError) == null ? void 0 : _b.call(_a);
      }).finally(() => {
        setIsRestoring(false);
      });
    }
    return isRestoring ? void 0 : persistQueryClientSubscribe(options);
  }, [props.client, isRestoring]);
  return /* @__PURE__ */ jsx(QueryClientProvider, { ...props, children: /* @__PURE__ */ jsx(IsRestoringProvider, { value: isRestoring, children }) });
};
export {
  PersistQueryClientProvider
};
//# sourceMappingURL=PersistQueryClientProvider.js.map