export function isObject(v: any): boolean {
    return v !== null && typeof v === 'object'
}

export function isNumber(v: any): boolean {
    return typeof v === 'number'
}

export function isString(v: any): boolean {
    return typeof v === 'string'
}

export function isFormData(v: any): boolean {
    return (typeof FormData !== 'undefined') && (v instanceof FormData)
}

export function isArray(v: any): boolean {
    return toString.call(v) === '[object Array]'
}

export function isBlob(v: any): boolean {
    return Object.prototype.toString.call(v) === '[object Blob]'
}

export function isFunction(v: any): boolean {
    return Object.prototype.toString.call(v) === '[object Function]'
}

export function isArrayBuffer(v: any): boolean {
    return Object.prototype.toString.call(v) === '[object ArrayBuffer]'
}

export function isStream(v: any): boolean {
    return isObject(v) && isFunction(v.pipe)
}

export function isBuffer (v: any): boolean {
    return v !== null && v.constructor !== null && typeof v.constructor.isBuffer === 'function' && v.constructor.isBuffer(v)
}