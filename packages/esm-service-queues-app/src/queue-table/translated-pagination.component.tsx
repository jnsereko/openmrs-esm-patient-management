import React from 'react';
import { Pagination, type PaginationProps } from '@carbon/react';
import { useTranslation } from 'react-i18next';

/**
 * Carbon's Pagination with its texts translated. Carbon only has English defaults ("Items per
 * page:", "1–10 of 25 items", "of 3 pages"), so the table showed them in English whatever the
 * session language.
 */
const TranslatedPagination: React.FC<PaginationProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Pagination
      backwardText={t('previousPage', 'Previous page')}
      forwardText={t('nextPage', 'Next page')}
      itemsPerPageText={t('itemsPerPage', 'Items per page:')}
      pageNumberText={t('pageNumber', 'Page number')}
      itemText={(min: number, max: number) => t('paginationItemText', '{{min}}–{{max}} items', { min, max })}
      itemRangeText={(min: number, max: number, total: number) =>
        t('paginationItemRangeText', {
          min,
          max,
          count: total,
          defaultValue_one: '{{min}}–{{max}} of {{count}} item',
          defaultValue_other: '{{min}}–{{max}} of {{count}} items',
        })
      }
      pageRangeText={(_current: number, total: number) =>
        t('paginationPageRangeText', {
          count: total,
          defaultValue_one: 'of {{count}} page',
          defaultValue_other: 'of {{count}} pages',
        })
      }
      pageText={(page: number) => t('paginationPageText', 'page {{page}}', { page })}
      {...props}
    />
  );
};

export default TranslatedPagination;
