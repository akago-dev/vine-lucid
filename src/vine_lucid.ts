/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LucidModel } from '@adonisjs/lucid/types/model'
import vine, { Vine, VineObject } from '@vinejs/vine'
import type { NullableModifier } from '@vinejs/vine/schema/base/main'
import { firstOrderPaths, subpathsObject, vineIsArray } from './helpers/index.js'
import { Relation } from './relation.js'

export type VineLucidModelOptions = {
  /**
   * noop (default) : don't do anything
   * keep : Keep primary key field
   * only : Keep only primary key field.
   *        If model has secondaryKey, primary or secondary are optional
   *        but one must be given.
   * This behaviour takes precedence on `update`
   */
  primaryKey?: 'keep' | 'only' | 'noop'

  /**
   * Exclude fields present in model's static property `excludeFromUpdate: string[]`.
   * Also take into account `relations`'s `excludeFromUpdate`.
   * Also takes into account mutability of relations.
   * This behaviour is overriten by `primaryKey` behaviour.
   */
  update?: boolean

  /**
   * Apply `.optional()` to all fields
   */
  partial?: boolean

  /**
   * Apply `.nullable()` to all fields. Useful for deleting relations.
   */
  null?: boolean

  /**
   * Relations to include in the schema.
   */
  relations?: Relation[]
}

type VineLucidReturn = VineObject<any, any, any, any>
type VineLucidReturnNullable = VineLucidReturn | NullableModifier<VineLucidReturn>

declare module '@vinejs/vine' {
  interface Vine {
    /**
     * Generates a vine schema based on model definition.
     * Specificaly, based on `@VineModel()` decorator of model properties.
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
  const columnProperties = model.$columnsDefinitions
    .toObject()
    .mapValues((v) => (v as any).meta?.vine)
  const computedProperties = model.$computedDefinitions
    .toObject()
    .mapValues((v) => (v as any).meta?.vine)

  const optionsRelationsFirstOrderNames = firstOrderPaths(options?.relations ?? [], (v) => v.name)

  const relationsProperties = model.$relationsDefinitions.toObject().mapValues((v, k) => {
    // Keep only relation present in options.relations
    if (!optionsRelationsFirstOrderNames.includes(k)) return undefined
    const optionRelation = (options?.relations ?? []).find((v) => v.name === k)

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

  let properties: { [k: string]: any } = {
    ...columnProperties,
    ...(options?.update || options?.partial ? {} : computedProperties),
    ...relationsProperties,
  }.exclude((v) => v === undefined)

  const modelKeys: string[] = [model.primaryKey]

  // Exclude
  const excludes: string[] = options?.update ? ((model as any).excludeFromUpdate ?? []) : []
  properties = properties.exclude((_v, k) => {
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
  properties = properties.mapValues((v, k) =>
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
    properties = properties.mapValues((v, k) =>
      k === model.primaryKey && !options?.partial ? v : v.optional()
    )

  // Secondary key(s) optionality
  // We want at least one of the primaryKey or the secondaryKey(s) to be set
  // ecepted if options.partial, in this cas every property is optional
  if (!options?.partial) {
    const pk = model.primaryKey
    const sks = (model as any).secondaryKeys
    if (sks?.length && Object.keys(properties).includesArray([pk, ...sks])) {
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
