import { t } from "../i18n/index.js";
import { cite } from "./sources.js";
export class Findings {
    items = [];
    lang;
    constructor(lang) {
        this.lang = lang;
    }
    add(severity, code, opts = {}) {
        this.items.push({
            code,
            severity,
            ...(opts.field ? { field: opts.field } : {}),
            message: t(this.lang, code, opts.params ?? {}),
            basis: cite(this.lang, ...(opts.basis ?? [])),
        });
    }
    get errors() {
        return this.items.filter((f) => f.severity === 'error').length;
    }
    get warnings() {
        return this.items.filter((f) => f.severity === 'warning').length;
    }
}
