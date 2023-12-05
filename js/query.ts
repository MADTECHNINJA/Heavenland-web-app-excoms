import { QueryProvider } from '~/types/QueryProvider.types';

export type SortOption = {
    name: string;
    key: string;
    value: string;
    current: boolean;
};

export const sortOptions: SortOption[] = [
    { name: 'Recently Listed', key: 'sort-by[date]', value: 'desc', current: false },
    { name: 'Price: Low to High', key: 'sort-by[price]', value: 'asc', current: true },
    { name: 'Price: High to Low', key: 'sort-by[price]', value: 'desc', current: false },
];

export const sortItems = async (queryProvider: QueryProvider, option: SortOption, onFinished: () => void) => {
    sortOptions.forEach((s) => {
        s.current = option.name === s.name;
    });

    for (const sort of sortOptions) {
        queryProvider.removeParam(sort.key);
    }

    if (option) {
        queryProvider.addParam(option.key, option.value);
    }

    queryProvider.setOffset(0);

    onFinished();
};
