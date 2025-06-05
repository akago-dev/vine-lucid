import { LucidModel } from '@adonisjs/lucid/types/model'
import vine, { symbols, Vine, VineObject } from '@vinejs/vine'
import type { NullableModifier } from '@vinejs/vine/schema/base/main'
import _ from 'lodash'
import { EnabledRelation } from './enabled_relations.js'
import { arrayIncludesArray, firstOrderPaths, mapToObject, subpathsObject } from './helpers.js'

export type VineLucidModelOptions = {
  /**
   * Exclude recursively fields present in model.excludeUpdate (See also : `primaryKey`)
   * Also takes into account mutability of relations.
   */
  update?: boolean
  /** Apply `.optional()` to all fields */
  partial?: boolean
  /** Accepts null as a correct value. Useful for deleting relations. */
  null?: boolean
  /** Relations to include in the schema.  */
  relations?: EnabledRelation[]
  /**
   * keep : Keep primary key field no matter the value of `update`
   * only : Keep only primary key field no matter the value of `update`.
   *        If model has secondaryKey, primary or secondary are optional
   *        but one must be given.
   * noop (default) : don't do anything
   */
  primaryKey?: 'keep' | 'only' | 'noop'
}

type VineLucidReturn = VineObject<any, any, any, any>
type VineLucidReturnNullable = VineLucidReturn | NullableModifier<VineLucidReturn>

declare module '@vinejs/vine' {
  interface Vine {
    /**
     * Generates a vine schema based on model definition.
     * Specificaly, based on `@VineModel()` decorator of model's properties.
     * @param model the model which properties are generated
     * @param options this options will be propagated to relations of the model
     * @returns a vine schema
     */
    lucid<M extends LucidModel>(
      model: M,
      options?: VineLucidModelOptions
    ): typeof options extends { null: true } ? VineLucidReturnNullable : VineLucidReturn
  }
}

/**
 * Generates a vine schema based on model definition.
 * Specificaly, based on `@VineModel()` decorator of model's properties.
 * @param model the model which properties are generated
 * @param options this options will also be propagated to relations of the model
 * @returns a vine schema
 */
const vineLucid = function <M extends LucidModel>(
  model: M,
  options?: VineLucidModelOptions
): typeof options extends { null: true } ? VineLucidReturnNullable : VineLucidReturn {
  const columnProperties = _.mapValues(
    mapToObject(model.$columnsDefinitions),
    (v) => (v as any).meta?.vine
  )
  const computedProperties = _.mapValues(
    mapToObject(model.$computedDefinitions),
    (v) => (v as any).meta?.vine
  )

  const optionsRelationsFirstOrderNames = firstOrderPaths(options?.relations ?? [], (v) => v.name)

  const relationsProperties = _.mapValues(mapToObject(model.$relationsDefinitions), (v, k) => {
    // Keep only relation present in options.relations
    if (!optionsRelationsFirstOrderNames.includes(k)) return undefined
    const optionRelation = _.find(options?.relations ?? [], (v) => v.name === k)

    // Remove readonly relations if update is true
    if (options?.update && optionRelation?.mutability === 'readOnly') return undefined

    // We want to rebuild the vine schema of the relation with the current options
    const meta = (v as any).meta
    if (meta?.model && meta?.vine) {
      // Forward options but update options.relations accordingly
      const forwardedRelationOptions: VineLucidModelOptions = {
        ...options, // TODO : use actual meta.vine options
        primaryKey:
          options?.update && optionRelation?.mutability === 'assignOnly' ? 'only' : 'keep',
        partial: options?.update && optionRelation?.mutability === 'full',
        relations: subpathsObject(
          options?.relations ?? [],
          k,
          (v) => v.name,
          (v, name) => v.copyWithName(name)
        ),
      }
      // Special case : relation is an "to-many"
      const newVine = vineLucid(meta.model, forwardedRelationOptions)
      return vineIsArray(meta.vine) ? vine.array(newVine) : newVine
    } else {
      return meta?.vine
    }
  })

  let properties = _.omitBy(
    {
      ...columnProperties,
      ...(options?.update || options?.partial ? {} : computedProperties),
      ...relationsProperties,
    },
    _.isUndefined
  )

  const modelKeys: string[] = [model.primaryKey]

  // Exclude
  const excludes: string[] = options?.update ? (model as any).excludeUpdate : []
  properties = _.omitBy(properties, (_v, k) => {
    switch (options?.primaryKey) {
      case undefined:
      case 'noop':
        return excludes.includes(k)
      case 'keep':
        return !modelKeys.includes(k) && excludes.includes(k)
      case 'only':
        return !modelKeys.includes(k)
    }
  })

  // Nullable
  properties = _.mapValues(properties, (v, k) =>
    // Relations
    optionsRelationsFirstOrderNames.includes(k)
      ? // Nullify "to one" relations
        !vineIsArray(v) ||
        // Nullify "to many" relations in update is true
        options?.update
        ? v.nullable()
        : v
      : // Fields
        options?.null || (options?.update && !modelKeys.includes(k))
        ? v.nullable()
        : v
  )

  // Optional
  if (options?.partial || options?.update)
    properties = _.mapValues(properties, (v, k) =>
      k === model.primaryKey && !options?.partial ? v : v.optional()
    )

  // Secondary key(s) optionality
  // We want at least one of the primaryKey or the secondaryKey(s) to be set
  // ecepted if options.partial, in this cas every property is optional
  if (!options?.partial) {
    const pk = model.primaryKey
    const sks = (model as any).secondaryKeys
    if (sks?.length && arrayIncludesArray(_.keys(properties), [pk, ...sks])) {
      if (pk in properties) properties[pk] = properties[pk].optional().requiredIfAnyMissing(sks)
      for (var sk of sks)
        if (sk in properties) {
          properties[sk] = properties[sk].optional().requiredIfMissing(pk)
        }
    }
  }

  const vineSchema = vine.object(properties)
  return (options?.null ? vineSchema.nullable() : vineSchema) as any
}

Vine.macro('lucid', vineLucid)

const vineIsArray = (vine: any): boolean => vine[symbols.UNIQUE_NAME] === 'vine.array'
