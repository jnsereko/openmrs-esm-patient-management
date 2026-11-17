import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18next, { type TFunction } from 'i18next';
import { render, screen } from '@testing-library/react';
import fr from '../../translations/fr.json';
import TranslatedPagination from './translated-pagination.component';

// The app's tests alias react-i18next to a mock that returns the English default; these need real
// translations, so useTranslation is backed by an i18next instance in the language under test.
const translation = vi.hoisted(() => ({ t: null as TFunction }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: translation.t }) }));

async function useLanguage(lng: 'en' | 'fr') {
  const i18n = i18next.createInstance();
  await i18n.init({ lng, resources: lng === 'fr' ? { fr: { translation: fr } } : {} });
  translation.t = i18n.t.bind(i18n);
}

describe('TranslatedPagination', () => {
  beforeAll(async () => {
    await useLanguage('en');
  });

  it("keeps Carbon's English texts in English", () => {
    render(<TranslatedPagination page={1} pageSize={10} pageSizes={[10, 20]} totalItems={25} />);

    expect(screen.getByText('Items per page:')).toBeInTheDocument();
    expect(screen.getByText('1–10 of 25 items')).toBeInTheDocument();
    expect(screen.getByText('of 3 pages')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });
});

describe('TranslatedPagination in French', () => {
  beforeAll(async () => {
    await useLanguage('fr');
  });

  it('shows the pagination texts in French, not Carbon English', () => {
    render(<TranslatedPagination page={1} pageSize={10} pageSizes={[10, 20]} totalItems={25} />);

    expect(screen.getByText('Éléments par page :')).toBeInTheDocument();
    expect(screen.getByText('1–10 sur 25 éléments')).toBeInTheDocument();
    expect(screen.getByText('sur 3 pages')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page suivante' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page précédente' })).toBeInTheDocument();
    expect(screen.queryByText('Items per page:')).not.toBeInTheDocument();
    expect(screen.queryByText('of 3 pages')).not.toBeInTheDocument();
  });

  it('uses the singular for one item and one page', () => {
    render(<TranslatedPagination page={1} pageSize={10} pageSizes={[10, 20]} totalItems={1} />);

    expect(screen.getByText('1–1 sur 1 élément')).toBeInTheDocument();
    expect(screen.getByText('sur 1 page')).toBeInTheDocument();
  });
});
