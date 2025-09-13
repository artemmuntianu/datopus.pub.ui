export class HttpRequestResult<T> {
    data: T | undefined;
    error: any;
}

export abstract class GoogleService {
    protected readonly clientId: string;

    constructor() {
        this.clientId =
            '67810031104-ur9cac38a90f2ka0sh776i9frrqr0kso.apps.googleusercontent.com';
    }

    protected async fetchData<T>(
        url: string,
        access_token: string,
        method: string,
        opts?: any
    ) {
        const result = new HttpRequestResult<T>();
        const _opts = {
            method,
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        };
        try {
            const response = await fetch(url, Object.assign(_opts, opts || {}));
            if (!response.ok)
                throw new Error(
                    response.status == 401
                        ? '401 Unauthorized'
                        : response.statusText
                );
            result.data = await response.json();
        } catch (e: any) {
            result.error = e;
        }
        return result;
    }
}
