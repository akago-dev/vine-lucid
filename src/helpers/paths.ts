/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export const firstOrderPaths = <T>(
  paths: T[],
  getter: (v: T) => string = (a) => a as any
): string[] => paths.map((e) => getter(e)).filter((v) => !v.includes('.'))

/**
 * This function processes an array of paths and returns a new array of objects.
 * It filters the paths based on a specified field and updates the paths accordingly.
 *
 * @template T - The type of elements in the paths array.
 * @param {T[]} paths - The array of paths to be processed.
 * @param {string} field - The field to filter the paths by.
 * @param {(o: T) => string} getter - A function that extracts a string from an element of type T.
 * @param {(o: T, newPath: string) => T} setter - A function that updates an element of type T with a new path.
 * @returns {T[]} - A new array of paths that have been filtered and updated.
 */
export const subpathsObject = <T>(
  paths: T[],
  field: string,
  getter: (o: T) => string,
  setter: (o: T, newPath: string) => T
): T[] =>
  paths
    .filter((path) => getter(path).startsWith(field + '.'))
    .map((path) => setter(path, getter(path).replace(field + '.', '')))
