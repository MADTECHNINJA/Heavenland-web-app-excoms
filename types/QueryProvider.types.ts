import { ITEMS_PER_PAGE } from '~/api/resources';

export class QueryProvider {
    queryParams = new URLSearchParams();

    constructor(params: [string, string][]) {
        for (const [k, v] of params) {
            this.addParam(k, v);
        }
    }

    addFilter(key: string, value: string) {
        this.queryParams.set(`filter[${key}]`, value);
    }

    addParam(key: string, value: string) {
        this.queryParams.set(key, value);
    }

    removeParam(key: string) {
        this.queryParams.delete(key);
    }

    removeAllParams(activeFilters: object) {
        for (const key in activeFilters) {
            this.removeParam(`filter[${key}]`);
        }
    }

    setOffset(offset: number) {
        this.#setOffset(offset);
    }

    setPage(page: number) {
        if (page < 1) {
            throw new Error('invalid value: page');
        }

        this.#setOffset(page - 1);
    }

    #setOffset(offset: number) {
        if (!this.queryParams.get('limit')) {
            this.addParam('limit', ITEMS_PER_PAGE.toString());
        }

        this.removeParam('offset');
        this.addParam('offset', (parseInt(this.queryParams.get('limit')) * offset).toString());
    }

    decode() {
        return decodeURI('?' + this.queryParams.toString()).replace(/%2C/g, ',');
    }
}
