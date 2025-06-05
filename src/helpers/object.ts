declare global {
  interface Object {
    /** Returns a copy of this with the elements that meet the condition specified in a callback function.
     */
    filter<T extends Record<string, unknown>>(
      this: T,
      predicate: (value: T[keyof T], key: string) => boolean
    ): Partial<T>

    /** Returns a copy of this with the elements that don't meet the condition specified in a callback function.
     */
    exclude<T extends Record<string, unknown>>(
      this: T,
      predicate: (value: T[keyof T], key: string) => boolean
    ): Partial<T>

    mapValues<T extends Record<string, any>, R>(
      this: T,
      mapper: (value: T[keyof T], key: string) => R
    ): { [K in keyof T]: R }
  }
}

Object.prototype.filter = function <T extends Record<string, unknown>>(
  this: T,
  predicate: (value: T[keyof T], key: string) => boolean
): Partial<T> {
  return Object.fromEntries(
    Object.entries(this).filter(([key, value]) => predicate(value as T[keyof T], key))
  ) as Partial<T>
}

Object.prototype.exclude = function <T extends Record<string, unknown>>(
  this: T,
  predicate: (value: T[keyof T], key: string) => boolean
): Partial<T> {
  return this.filter((v, k) => !predicate(v, k))
}

Object.prototype.mapValues = function <T extends Record<string, any>, R>(
  this: T,
  mapper: (value: T[keyof T], key: string) => R
): { [K in keyof T]: R } {
  const result = {} as { [K in keyof T]: R }
  for (const key in this) {
    if (Object.prototype.hasOwnProperty.call(this, key)) {
      result[key as keyof T] = mapper(this[key], key)
    }
  }
  return result
}
