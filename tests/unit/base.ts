import { BaseModel, column } from '@adonisjs/lucid/orm'
import vine from '@vinejs/vine'
import { VineModel } from '../../index.js'

export class ClassFields extends BaseModel {
  static excludeUpdate = ['fieldA', 'fieldC']

  @VineModel(vine.string())
  @column({ isPrimary: true })
  declare fieldA: string

  @VineModel(vine.string())
  @column()
  declare fieldB: string

  @VineModel(vine.number().optional())
  @column()
  declare fieldC: number | undefined

  @VineModel(vine.number().nullable())
  @column()
  declare fieldD: number | null
}

export class Child extends BaseModel {
  static excludeUpdate = ['childFieldA']

  @VineModel(vine.string())
  @column({ isPrimary: true })
  declare childFieldA: string

  @VineModel(vine.string())
  @column()
  declare childFieldB: string
}
