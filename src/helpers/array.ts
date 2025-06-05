/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare global {
  interface Array<T> {
    /**
     * Returns true is every element of `other` is included in `this`
     */
    includesArray<U>(this: Array<T>, other: Array<U>): boolean
  }
}

Object.defineProperty(Array.prototype, 'includesArray', {
  value: function <T, U>(this: Array<T>, other: Array<U>): boolean {
    return other.every((e) => this.includes(e as any))
  },
})
