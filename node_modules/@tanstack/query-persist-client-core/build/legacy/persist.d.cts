import { DehydratedState, QueryClient, HydrateOptions, DehydrateOptions } from '@tanstack/query-core';

type Promisable<T> = T | PromiseLike<T>;
interface Persister {
    persistClient: (persistClient: PersistedClient) => Promisable<void>;
    restoreClient: () => Promisable<PersistedClient | undefined>;
    removeClient: () => Promisable<void>;
}
interface PersistedClient {
    timestamp: number;
    buster: string;
    clientState: DehydratedState;
}
interface PersistQueryClientRootOptions {
    /** The QueryClient to persist */
    queryClient: QueryClient;
    /** The Persister interface for storing and restoring the cache
     * to/from a persisted location */
    persister: Persister;
    /** A unique string that can be used to forcefully
     * invalidate existing caches if they do not share the same buster string */
    buster?: string;
}
interface PersistedQueryClientRestoreOptions extends PersistQueryClientRootOptions {
    /** The max-allowed age of the cache in milliseconds.
     * If a persisted cache is found that is older than this
     * time, it will be discarded */
    maxAge?: number;
    /** The options passed to the hydrate function */
    hydrateOptions?: HydrateOptions;
}
interface PersistedQueryClientSaveOptions extends PersistQueryClientRootOptions {
    /** The options passed to the dehydrate function */
    dehydrateOptions?: DehydrateOptions;
}
interface PersistQueryClientOptions extends PersistedQueryClientRestoreOptions, PersistedQueryClientSaveOptions, PersistQueryClientRootOptions {
}
/**
 * Restores persisted data to the QueryCache
 *  - data obtained from persister.restoreClient
 *  - data is hydrated using hydrateOptions
 * If data is expired, busted, empty, or throws, it runs persister.removeClient
 */
declare function persistQueryClientRestore({ queryClient, persister, maxAge, buster, hydrateOptions, }: PersistedQueryClientRestoreOptions): Promise<void>;
/**
 * Persists data from the QueryCache
 *  - data dehydrated using dehydrateOptions
 *  - data is persisted using persister.persistClient
 */
declare function persistQueryClientSave({ queryClient, persister, buster, dehydrateOptions, }: PersistedQueryClientSaveOptions): Promise<void>;
/**
 * Subscribe to QueryCache and MutationCache updates (for persisting)
 * @returns an unsubscribe function (to discontinue monitoring)
 */
declare function persistQueryClientSubscribe(props: PersistedQueryClientSaveOptions): () => void;
/**
 * Restores persisted data to QueryCache and persists further changes.
 */
declare function persistQueryClient(props: PersistQueryClientOptions): [() => void, Promise<void>];

export { type PersistQueryClientOptions, type PersistQueryClientRootOptions, type PersistedClient, type PersistedQueryClientRestoreOptions, type PersistedQueryClientSaveOptions, type Persister, type Promisable, persistQueryClient, persistQueryClientRestore, persistQueryClientSave, persistQueryClientSubscribe };
