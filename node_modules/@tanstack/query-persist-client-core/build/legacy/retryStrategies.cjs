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

// src/retryStrategies.ts
var retryStrategies_exports = {};
__export(retryStrategies_exports, {
  removeOldestQuery: () => removeOldestQuery
});
module.exports = __toCommonJS(retryStrategies_exports);
var removeOldestQuery = ({ persistedClient }) => {
  const mutations = [...persistedClient.clientState.mutations];
  const queries = [...persistedClient.clientState.queries];
  const client = {
    ...persistedClient,
    clientState: { mutations, queries }
  };
  const sortedQueries = [...queries].sort(
    (a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt
  );
  if (sortedQueries.length > 0) {
    const oldestData = sortedQueries.shift();
    client.clientState.queries = queries.filter((q) => q !== oldestData);
    return client;
  }
  return void 0;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  removeOldestQuery
});
//# sourceMappingURL=retryStrategies.cjs.map