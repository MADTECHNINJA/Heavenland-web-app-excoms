import { MarketplaceStats } from '~/types/Stats.types';
import { reactive } from 'vue';

export enum CollectionName {
    EXCOMS = 'excoms',
}

export type CollectionDetails = {
    id: string;
    name: string;
    creator: string;
    description: string;
    unit: string;
    isComingSoon: boolean;
    isHeavenland: boolean;
    featureFlags?: {
        allowStaking?: boolean;
        allowDao?: boolean;
        allowListing?: boolean;
        allowStamping?: boolean;
    };
};

export enum FilterType {
    SLIDER,
    RADIUS,
    OPTIONS,
}

enum FilterRadiusValues {
    COORDINATE_X = 'coordinate-x',
    COORDINATE_Y = 'coordinate-y',
}

export type FilterValueOption = { label: string; checked: boolean };

export interface IFilterType {
    type: FilterType;
    updateFilter: (value: any) => void;
    clearFilter: (value?: string) => void;
    getActiveFilters(): string[];
    getUiActiveFilters(): string[];
}

class FilterTypeSlider implements IFilterType {
    readonly type = FilterType.SLIDER;
    slider?: {
        min: number;
        max: number;
        amount: Array<number> | number;
        values: number[];
    };

    constructor(slider: { min: number; max: number; amount: Array<number>; values: number[] }) {
        this.slider = reactive(slider);
    }

    clearFilter() {
        this.updateFilter([this.slider.min, this.slider.max]);
    }

    updateFilter(amount: number[]) {
        this.slider.amount = amount;
    }

    isEnabled() {
        return this.slider.min !== this.slider.amount[0] || this.slider.max !== this.slider.amount[1];
    }

    getActiveFilters() {
        if (!this.isEnabled()) {
            return [];
        }

        return [`${this.slider.amount[0]}:${this.slider.amount[1]}`];
    }

    getUiActiveFilters() {
        return this.getActiveFilters().map((v) => v.replace(':', ' - '));
    }
}

class FilterTypeOptions implements IFilterType {
    readonly type = FilterType.OPTIONS;
    values: FilterValueOption[];

    constructor(values: FilterValueOption[]) {
        this.values = reactive(values);
    }

    clearFilter(value: string) {
        const option = this.values.find((o) => o.label === value);

        if (option) {
            this.updateFilter(option);
        }
    }

    updateFilter(option: FilterValueOption) {
        this.values.find((o) => o.label === option.label).checked = !option.checked;
    }

    getActiveFilters() {
        return this.values.reduce((acc, option) => {
            if (option.checked) {
                acc.push(option.label);
            }

            return acc;
        }, []);
    }

    getUiActiveFilters() {
        return this.getActiveFilters();
    }
}

class FilterTypeRadius implements IFilterType {
    readonly type = FilterType.RADIUS;
    amount: number;
    values: FilterValueOption[];

    constructor(values: FilterValueOption[]) {
        this.amount = null;
        this.values = values;
    }

    updateFilter(amount: number | string) {
        this.amount = typeof amount === 'string' ? parseInt(amount) : amount;
    }

    clearFilter() {
        this.updateFilter(null);
    }

    isEnabled() {
        return this.amount !== null;
    }

    getActiveFilters() {
        if (!this.isEnabled()) {
            return [];
        }

        return [this.amount].map((v) => `${v - 2 * 25}:${v + 2 * 25}`);
    }

    getUiActiveFilters() {
        if (!this.isEnabled()) {
            return [];
        }

        return [this.amount].map((v) => `~ ${v}`);
    }
}

export class CollectionFilters {
    name: string;
    filterId: string;
    filterSingleValueType: string | number | 'yes_or_number';
    filterValueTypes: Array<'single' | 'list' | 'range'>;
    uiType: FilterTypeRadius | FilterTypeOptions | FilterTypeSlider;

    constructor(data: any) {
        this.name = data.name;
        this.filterId = data.filterId;
        this.filterSingleValueType = data.filterSingleValueType;
        this.filterValueTypes = data.filterValueTypes;

        if (this.filterId === FilterRadiusValues.COORDINATE_X || this.filterId === FilterRadiusValues.COORDINATE_Y) {
            this.uiType = reactive(
                new FilterTypeRadius(
                    data.values.map((v) => {
                        return {
                            label: v,
                            checked: false,
                        };
                    })
                )
            );
        } else if (data.filterValueTypes.includes('range')) {
            const sortedData = data.values.sort((a, b) => (Number(a) > Number(b) ? 1 : -1));

            this.uiType = reactive(
                new FilterTypeSlider({
                    min: Number(sortedData[0]),
                    max: Number(sortedData[sortedData.length - 1]),
                    amount: [Number(sortedData[0]), Number(sortedData[sortedData.length - 1])],
                    values: sortedData,
                })
            );
        } else {
            this.uiType = reactive(
                new FilterTypeOptions(
                    data.values.map((v) => {
                        return {
                            label: v,
                            checked: false,
                        };
                    })
                )
            );
        }
    }
}

export class CollectionMetadata {
    id: string;
    name: string;
    creator: string;
    route: string;
    traits: Array<{
        displayName: string;
        filterable: boolean;
        name: string;
    }>;
    filters?: Array<CollectionFilters>;
    stats?: MarketplaceStats;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.creator = data.creator;
        this.traits = data.traits;

        this.filters = data.filters
            .sort((a, b) => {
                a.values.sort((a, b) => (a >= b ? 1 : -1));
                return a.name >= b.name ? 1 : -1;
            })
            .map((f) => {
                return new CollectionFilters(f);
            });

        this.stats = new MarketplaceStats(data.stats);

        this.route = data.name.toLowerCase();
    }
}
