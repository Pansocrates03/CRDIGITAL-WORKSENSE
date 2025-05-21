"use strict";
"use client";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/PersistQueryClientProvider.tsx
var PersistQueryClientProvider_exports = {};
__export(PersistQueryClientProvider_exports, {
  PersistQueryClientProvider: () => PersistQueryClientProvider
});
module.exports = __toCommonJS(PersistQueryClientProvider_exports);
var React = __toESM(require("react"), 1);
var import_query_persist_client_core = require("@tanstack/query-persist-client-core");
var import_react_query = require("@tanstack/react-query");
var import_jsx_runtime = require("react/jsx-runtime");
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
      (0, import_query_persist_client_core.persistQueryClientRestore)(options).then(() => refs.current.onSuccess?.()).catch(() => refs.current.onError?.()).finally(() => {
        setIsRestoring(false);
      });
    }
    return isRestoring ? void 0 : (0, import_query_persist_client_core.persistQueryClientSubscribe)(options);
  }, [props.client, isRestoring]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_query.QueryClientProvider, { ...props, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_query.IsRestoringProvider, { value: isRestoring, children }) });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PersistQueryClientProvider
});
//# sourceMappingURL=PersistQueryClientProvider.cjs.map