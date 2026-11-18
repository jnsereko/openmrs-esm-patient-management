import { useMemo } from 'react';
import { restBaseUrl, useConfig, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type Provider } from '../types';

/** Providers asked for per request: with no limit the server's default (50) silently cut the list short. */
const pageSize = 100;

/** Whether a provider identifier is excluded: listed as is, or matched by an entry ending with `*` as a prefix. */
export function isExcluded(identifier: string | undefined, excludedIdentifiers: Array<string>) {
  if (!identifier) {
    return false;
  }
  return excludedIdentifiers.some((excluded) =>
    excluded.endsWith('*') ? identifier.startsWith(excluded.slice(0, -1)) : identifier === excluded,
  );
}

/**
 * Every active provider, read page by page, except those whose identifier the app config's
 * `excludedProviderIdentifiers` lists. The provider `keptProviderUuid` stays in the list even when excluded,
 * so a provider the form already holds (the appointment's, or the signed-in user's) is the one it shows.
 */
export function useProviders(keptProviderUuid?: string) {
  const { excludedProviderIdentifiers } = useConfig<ConfigObject>();
  const apiUrl = `${restBaseUrl}/provider?v=custom:(uuid,display,identifier,person:(uuid,display))&limit=${pageSize}`;
  const { data, error, isLoading, isValidating } = useOpenmrsFetchAll<Provider>(apiUrl);

  const providers = useMemo(
    () =>
      (data ?? []).filter(
        (provider) =>
          provider.uuid === keptProviderUuid || !isExcluded(provider.identifier, excludedProviderIdentifiers ?? []),
      ),
    [data, excludedProviderIdentifiers, keptProviderUuid],
  );

  return {
    providers,
    isLoading,
    error,
    isValidating,
  };
}
