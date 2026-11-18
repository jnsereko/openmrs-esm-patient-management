import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { restBaseUrl, useConfig, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { isExcluded, useProviders } from './useProviders';

const mockUseConfig = vi.mocked(useConfig);
const mockUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);

const provider = (identifier: string, uuid = `uuid-${identifier}`) => ({
  uuid,
  identifier,
  display: `${identifier} - Name`,
});

const returnProviders = (providers: Array<ReturnType<typeof provider>>) =>
  mockUseOpenmrsFetchAll.mockReturnValue({
    data: providers,
    isLoading: false,
    error: null,
    isValidating: false,
  } as unknown as ReturnType<typeof useOpenmrsFetchAll>);

describe('useProviders', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ excludedProviderIdentifiers: [] });
  });

  it('reads every page of providers, 100 at a time, not only the 50 the server returns by default (UVL-EMR #766)', () => {
    const providers = Array.from({ length: 104 }, (_, i) => provider(`staff.${i}`));
    returnProviders(providers);

    const { result } = renderHook(() => useProviders());

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalledWith(
      `${restBaseUrl}/provider?v=custom:(uuid,display,identifier,person:(uuid,display))&limit=100`,
    );
    expect(result.current.providers).toHaveLength(104);
  });

  it('leaves out the providers excluded by the app config', () => {
    mockUseConfig.mockReturnValue({ excludedProviderIdentifiers: ['admin', 'service-account-*'] });
    returnProviders([
      provider('admin'),
      provider('service-account-eip'),
      provider('service-account-orthanc-service'),
      provider('nurse.one'),
    ]);

    const { result } = renderHook(() => useProviders());

    expect(result.current.providers.map((p) => p.identifier)).toEqual(['nurse.one']);
  });

  it('keeps an excluded provider the form already holds, so the form shows the provider it saves', () => {
    mockUseConfig.mockReturnValue({ excludedProviderIdentifiers: ['admin', 'service-account-*'] });
    returnProviders([provider('admin', 'admin-uuid'), provider('service-account-eip'), provider('nurse.one')]);

    const { result } = renderHook(() => useProviders('admin-uuid'));

    expect(result.current.providers.map((p) => p.identifier)).toEqual(['admin', 'nurse.one']);
  });

  it('excludes nobody by default', () => {
    mockUseConfig.mockReturnValue({});
    returnProviders([provider('admin'), provider('nurse.one')]);

    const { result } = renderHook(() => useProviders());

    expect(result.current.providers).toHaveLength(2);
  });

  it('is an empty list while the providers load', () => {
    mockUseOpenmrsFetchAll.mockReturnValue({ data: undefined, isLoading: true } as unknown as ReturnType<
      typeof useOpenmrsFetchAll
    >);

    const { result } = renderHook(() => useProviders());

    expect(result.current.providers).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});

describe('isExcluded', () => {
  it('matches an identifier exactly, or by prefix for an entry ending with *', () => {
    expect(isExcluded('admin', ['admin'])).toBe(true);
    expect(isExcluded('administrator', ['admin'])).toBe(false);
    expect(isExcluded('service-account-orthanc-service', ['service-account-*'])).toBe(true);
    expect(isExcluded('nurse.one', ['service-account-*'])).toBe(false);
    expect(isExcluded(undefined, ['*'])).toBe(false);
  });
});
