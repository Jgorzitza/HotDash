export class ServiceError extends Error {
    options;
    constructor(message, options) {
        super(message);
        this.options = options;
        this.name = "ServiceError";
    }
    get scope() {
        return this.options.scope;
    }
    get code() {
        return this.options.code;
    }
    get retryable() {
        return this.options.retryable ?? false;
    }
}
//# sourceMappingURL=types.js.map