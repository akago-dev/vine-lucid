declare global {
  /**
   * Creates a object with the same keys & values as `this`
   */
  interface Map<K extends string | number | symbol, V> {
    toObject(this: Map<K, V>): { K: V }
  }
}

Object.defineProperty(Map.prototype, 'toObject', {
  value: function <K extends string | number | symbol, V>(this: Map<K, V>): Record<K, V> {
    const obj: Partial<Record<K, V>> = {}
    for (const [key, value] of this.entries()) {
      obj[key] = value
    }
    return obj as Record<K, V>
  },
})
