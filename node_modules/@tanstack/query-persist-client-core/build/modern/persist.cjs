"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/persist.ts
var persist_exports = {};
__export(persist_exports, {
  persistQueryClient: () => persistQueryClient,
  persistQueryClientRestore: () => persistQueryClientRestore,
  persistQueryClientSave: () => persistQueryClientSave,
  persistQueryClientSubscribe: () => persistQueryClientSubscribe
});
module.exports = __toCommonJS(persist_exports);
var import_query_core = require("@tanstack/query-core");
var cacheEventTypes = ["added", "removed", "updated"];
function isCacheEventType(eventType) {
  return cacheEventTypes.includes(eventType);
}
async function persistQueryClientRestore({
  queryClient,
  persister,
  maxAge = 1e3 * 60 * 60 * 24,
  buster = "",
  hydrateOptions
}) {
  try {
    const persistedClient = await persister.restoreClient();
    if (persistedClient) {
      if (persistedClient.timestamp) {
        const expired = Date.now() - persistedClient.timestamp > maxAge;
        const busted = persistedClient.buster !== buster;
        if (expired || busted) {
          return persister.removeClient();
        } else {
          (0, import_query_core.hydrate)(queryClient, persistedClient.clientState, hydrateOptions);
        }
      } else {
        return persister.removeClient();
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error(err);
      console.warn(
        "Encountered an error attempting to restore client cache from persisted location. As a precaution, the persisted cache will be discarded."
      );
    }
    await persister.removeClient();
    throw err;
  }
}
async function persistQueryClientSave({
  queryClient,
  persister,
  buster = "",
  dehydrateOptions
}) {
  const persistClient = {
    buster,
    timestamp: Date.now(),
    clientState: (0, import_query_core.dehydrate)(queryClient, dehydrateOptions)
  };
  await persister.persistClient(persistClient);
}
function persistQueryClientSubscribe(props) {
  const unsubscribeQueryCache = props.queryClient.getQueryCache().subscribe((event) => {
    if (isCacheEventType(event.type)) {
      persistQueryClientSave(props);
    }
  });
  const unsubscribeMutationCache = props.queryClient.getMutationCache().subscribe((event) => {
    if (isCacheEventType(event.type)) {
      persistQueryClientSave(props);
    }
  });
  return () => {
    unsubscribeQueryCache();
    unsubscribeMutationCache();
  };
}
function persistQueryClient(props) {
  let hasUnsubscribed = false;
  let persistQueryClientUnsubscribe;
  const unsubscribe = () => {
    hasUnsubscribed = true;
    persistQueryClientUnsubscribe?.();
  };
  const restorePromise = persistQueryClientRestore(props).then(() => {
    if (!hasUnsubscribed) {
      persistQueryClientUnsubscribe = persistQueryClientSubscribe(props);
    }
  });
  return [unsubscribe, restorePromise];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  persistQueryClient,
  persistQueryClientRestore,
  persistQueryClientSave,
  persistQueryClientSubscribe
});
//# sourceMappingURL=persist.cjs.map