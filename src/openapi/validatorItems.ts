import { type ValidatorItem } from '.';

export const paginationQuery: ValidatorItem[] = [
  { key: 'page', type: 'number', nullable: true },
  { key: 'limit', type: 'number', nullable: true },
];

export const searchPaginationQuery: ValidatorItem[] = [
  ...paginationQuery,
  { key: 'q', type: 'string', nullable: true },
];
