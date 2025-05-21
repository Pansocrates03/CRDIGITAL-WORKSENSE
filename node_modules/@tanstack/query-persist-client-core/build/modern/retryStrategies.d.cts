import { PersistedClient } from './persist.cjs';
import '@tanstack/query-core';

type PersistRetryer = (props: {
    persistedClient: PersistedClient;
    error: Error;
    errorCount: number;
}) => PersistedClient | undefined;
declare const removeOldestQuery: PersistRetryer;

export { type PersistRetryer, removeOldestQuery };
