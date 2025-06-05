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
