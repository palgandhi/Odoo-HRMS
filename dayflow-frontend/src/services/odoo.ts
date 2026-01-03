/**
 * Odoo JSON-RPC Service
 * Connects the React Frontend to the Odoo Backend
 */

// We will use the native fetch API to talk to Odoo's JSON-RPC endpoint
export const odooCall = async (method: string, params: any = {}) => {
    const payload = {
        jsonrpc: "2.0",
        method: method,
        params: params,
        id: Math.floor(Math.random() * 1000),
    };

    try {
        const response = await fetch('/jsonrpc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.error) {
            console.error("Odoo Error:", data.error);
            throw new Error(data.error.data.message || data.error.message);
        }

        return data.result;
    } catch (error) {
        console.error("API Call Failed:", error);
        throw error;
    }
};

// Authentication Service
export const login = async (db: string, login: string, password: string) => {
    return odooCall("call", {
        service: "common",
        method: "login",
        args: [db, login, password],
    });
};

// Generic Model Method Caller (e.g., search_read, create, write)
export const executeKw = async (
    uid: number,
    password: string,
    model: string,
    operation: string,
    args: any[] = [],
    kwargs: any = {}
) => {
    return odooCall("call", {
        service: "object",
        method: "execute_kw",
        args: ["dayflow_db", uid, password, model, operation, args, kwargs]
    });
};
