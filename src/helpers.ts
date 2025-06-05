import { belongsTo, column } from '@adonisjs/lucid/orm'
import { ColumnOptions, LucidModel, TypedDecorator } from '@adonisjs/lucid/types/model'
import { BelongsTo, HasOne, RelationOptions } from '@adonisjs/lucid/types/relations'
import vine, { BaseModifiersType } from '@vinejs/vine'
import assert from 'assert'
import _ from 'lodash'

export const arrayIncludesArray = <T>(arr1: T[], arr2: T[]) => arr2.every((e) => arr1.includes(e))

export const firstOrderPaths = <T>(
  paths: T[],
  getter: (v: T) => string = (a) => a as any
): string[] => paths.map((e) => getter(e)).filter((v) => !v.includes('.'))

export const mapToObject = <K extends string | number | symbol, V>(
  map: Map<K, V>
): Record<K, V> => {
  const obj: Partial<Record<K, V>> = {}
  for (const [key, value] of map.entries()) {
    obj[key] = value
  }
  return obj as Record<K, V>
}

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
  const cleanJson = ({ refs, ...obj }: any) => ({ ...obj, refs: _.keys(refs) })

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
