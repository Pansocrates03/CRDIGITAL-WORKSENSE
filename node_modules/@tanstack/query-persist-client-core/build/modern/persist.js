// src/persist.ts
import { dehydrate, hydrate } from "@tanstack/query-core";
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
          hydrate(queryClient, persistedClient.clientState, hydrateOptions);
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
    clientState: dehydrate(queryClient, dehydrateOptions)
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
export {
  persistQueryClient,
  persistQueryClientRestore,
  persistQueryClientSave,
  persistQueryClientSubscribe
};
//# sourceMappingURL=persist.js.map