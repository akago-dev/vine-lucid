import { belongsTo, column } from '@adonisjs/lucid/orm'
import { ColumnOptions, LucidModel, TypedDecorator } from '@adonisjs/lucid/types/model'
import { BelongsTo, HasOne, RelationOptions } from '@adonisjs/lucid/types/relations'
import vine, { BaseModifiersType } from '@vinejs/vine'
import assert from 'assert'

export const arrayIncludesArray = <T>(arr1: T[], arr2: T[]) => arr2.every((e) => arr1.includes(e))

export const firstOrderPaths = <T>(
  paths: T[],
  getter: (v: T) => string = (a) => a as any
): string[] => paths.map((e) => getter(e)).filter((v) => !v.includes('.'))

export const subpathsObject = <T>(
  paths: T[],
  field: string,
  getter: (o: T) => string,
  setter: (o: T, newPath: string) => T
): T[] =>
  paths
    .filter((path) => getter(path).startsWith(field + '.'))
    .map((path) => setter(path, getter(path).replace(field + '.', '')))

export const assertVineEquals = <Input, Output, CamelCaseOutput>(
  schemaA: BaseModifiersType<Input, Output, CamelCaseOutput>,
  schemaB: BaseModifiersType<Input, Output, CamelCaseOutput>
) => {
  // We can't test equality of refs as they contain functions
  // So we just make sure their names match
  const cleanJson = ({ refs, ...obj }: any) => ({ ...obj, refs: Object.keys(refs) })

  const jsonA = cleanJson(vine.compile(schemaA).toJSON())
  const jsonB = cleanJson(vine.compile(schemaB).toJSON())
  assert.notEqual(jsonA, null)
  assert.deepEqual(jsonA, jsonB)
}

/**
 * Equivalent to `@belongsTo()`, also adds a `@column(idColumnOptions)` on the same field name suffixed by `Id`
 */
export const belongsToWithIdColumn = <RelatedModel extends LucidModel>(
  model: () => RelatedModel,
  options?: RelationOptions<RelatedModel, LucidModel, HasOne<RelatedModel, LucidModel>>,
  idColumnOptions?: Partial<ColumnOptions>
): TypedDecorator<BelongsTo<RelatedModel> | null> => {
  return (target, propertyKey) => {
    belongsTo(model, options)(target, propertyKey)

    // Add id column
    const foreignKey = `${propertyKey}Id`
    column(idColumnOptions)(target, foreignKey as keyof typeof target)
  }
}

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

declare global {
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
