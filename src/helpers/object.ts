/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Returns a copy of this with the elements that meet the condition specified in a callback function.
 */
export const objectFilter = function <T extends Record<string, unknown>>(
  o: T,
  predicate: (value: T[keyof T], key: string) => boolean
): Partial<T> {
  return Object.fromEntries(
    Object.entries(o).filter(([key, value]) => predicate(value as T[keyof T], key))
  ) as Partial<T>
}

/**
 * Returns a copy of this with the elements that don't meet the condition specified in a callback function.
 */
export const objectExclude = function <T extends Record<string, unknown>>(
  o: T,
  predicate: (value: T[keyof T], key: string) => boolean
): Partial<T> {
  return objectFilter(o, (v, k) => !predicate(v, k))
}

/**
 * Creates a new object with the same keys as `this` and values mapped by `mapper`
 */
export const objectMapValues = function <T extends Record<string, any>, R>(
  o: T,
  mapper: (value: T[keyof T], key: string) => R
): { [K in keyof T]: R } {
  const result = {} as { [K in keyof T]: R }
  for (const key in o) {
    if (Object.prototype.hasOwnProperty.call(o, key)) {
      result[key as keyof T] = mapper(o[key], key)
    }
  }
  return result
}
