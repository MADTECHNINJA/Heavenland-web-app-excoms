import type { AxiosResponse } from 'axios';

export class ErrorWrapper {
    hasError = false;
    object: AxiosResponse | null = null;

    set(hasError: boolean, error?: AxiosResponse) {
        this.hasError = hasError;
        this.object = error ?? null;
    }

    get statusCode() {
        return this.object?.status;
    }
}

export class DataWrapper<T> {
    fetched = false;
    private _error: ErrorWrapper = new ErrorWrapper();
    data: T | null = null;

    setData(data: T) {
        this.fetched = true;
        this._error.set(false);
        this.data = data;
    }

    setError(error?: AxiosResponse) {
        this.fetched = true;
        this._error.set(true, error);
        this.data = null;
    }

    clear() {
        this.fetched = false;
        this._error.set(false);
        this.data = null;
    }

    get error() {
        return this._error.hasError;
    }

    get statusCode() {
        return this._error.statusCode;
    }
}
