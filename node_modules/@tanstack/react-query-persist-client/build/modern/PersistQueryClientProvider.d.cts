import { PersistQueryClientOptions } from '@tanstack/query-persist-client-core';
import * as React from 'react';
import { QueryClientProviderProps, OmitKeyof } from '@tanstack/react-query';

type PersistQueryClientProviderProps = QueryClientProviderProps & {
    persistOptions: OmitKeyof<PersistQueryClientOptions, 'queryClient'>;
    onSuccess?: () => Promise<unknown> | unknown;
    onError?: () => Promise<unknown> | unknown;
};
declare const PersistQueryClientProvider: ({ children, persistOptions, onSuccess, onError, ...props }: PersistQueryClientProviderProps) => React.JSX.Element;

export { PersistQueryClientProvider, type PersistQueryClientProviderProps };
