import { PersistedClient } from './persist.js';
import '@tanstack/query-core';

type PersistRetryer = (props: {
    persistedClient: PersistedClient;
    error: Error;
    errorCount: number;
}) => PersistedClient | undefined;
declare const removeOldestQuery: PersistRetryer;

export { type PersistRetryer, removeOldestQuery };
