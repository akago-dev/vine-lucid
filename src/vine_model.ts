import { LucidModel } from '@adonisjs/lucid/types/model'
import { BaseLiteralType } from '@vinejs/vine'
import _ from 'lodash'
import { VineModelSchemasInstallers } from './provider.js'

/**
 * See `vine.lucid()`
 */
export function VineModel<VineSchema extends BaseLiteralType<any, any, any>, M extends LucidModel>(
  /** A vine schema to register. Use function to avoid circular dependencies issues. */
  schema: VineSchema | (() => VineSchema) | any,
  /** In cases of a relation, the model is needed. Use function to avoid circular dependencies issues. */
  model?: M | (() => any) | undefined
) {
  return function (target: any, propertyName: string) {
    /**
     * We store `schema` & `model` in lucid's definition's meta object.
     * In case of a function for those values, we register the setup of the meta data
     * for later (See: VineModelSchemasInstallers)
     */
    const parentModel = target.constructor as LucidModel
    parentModel.boot()
    const definition =
      parentModel.$columnsDefinitions.get(propertyName) ||
      parentModel.$computedDefinitions.get(propertyName) ||
      (parentModel.$relationsDefinitions.get(propertyName) as any)
    if (definition)
      if (_.isFunction(schema)) {
        if (_.isFunction(model))
          VineModelSchemasInstallers.push(
            () =>
              (definition.meta = {
                ...definition.meta,
                vine: schema(),
                model: model(),
              })
          )
        else
          throw Error(
            `VineModel : can't install property ${propertyName}. You must also provide the model as a function.`
          )
      } else
        definition.meta = {
          ...definition.meta,
          vine: schema,
          model,
        }
  }
}
