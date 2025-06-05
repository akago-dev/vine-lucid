import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import {
  assertVineEquals,
  belongsToWithIdColumn,
  EnabledRelation,
  VineModel,
} from '../../../index.js'

test('Relation | mutability assignOnly | update | secondaryKey', async () => {
  class ChildSecondary extends BaseModel {
    static excludeUpdate = ['childFieldA']
    static secondaryKey = 'childFieldB'

    @VineModel(vine.string())
    @column({ isPrimary: true })
    declare childFieldA: string

    @VineModel(vine.string())
    @column()
    declare childFieldB: string
  }

  class ParentSecondary extends BaseModel {
    static excludeUpdate = ['fieldA', 'fieldC']

    @VineModel(vine.string())
    @column({ isPrimary: true })
    declare fieldA: string

    @VineModel(vine.lucid(ChildSecondary, { partial: true, null: true }), ChildSecondary)
    @belongsToWithIdColumn(() => ChildSecondary)
    declare child: BelongsTo<typeof ChildSecondary>
  }

  assertVineEquals(
    vine.lucid(ParentSecondary, {
      relations: [EnabledRelation.assignOnly('child')],
      update: true,
    }),
    vine.object({
      child: vine
        .object({
          childFieldA: vine.string().optional().requiredIfAnyMissing(['childFieldB']),
          childFieldB: vine.string().optional().requiredIfMissing('childFieldA'),
        })
        .nullable()
        .optional(),
    })
  )
})

test('Relation | mutability assignOnly | update | secondaryKey', async () => {
  class ChildSecondary extends BaseModel {
    static excludeUpdate = ['childFieldA']
    static secondaryKey = 'childFieldB'

    @VineModel(vine.string())
    @column({ isPrimary: true })
    declare childFieldA: string

    @VineModel(vine.string())
    @column()
    declare childFieldB: string
  }

  class ParentSecondary extends BaseModel {
    static excludeUpdate = ['fieldA']

    @VineModel(vine.string())
    @column({ isPrimary: true })
    declare fieldA: string

    @VineModel(
      vine.array(vine.lucid(ChildSecondary, { partial: true, null: true })),
      ChildSecondary
    )
    @manyToMany(() => ChildSecondary)
    declare children: ManyToMany<typeof ChildSecondary>
  }

  assertVineEquals(
    vine.lucid(ParentSecondary, {
      relations: [EnabledRelation.assignOnly('children')],
      update: true,
    }),
    vine.object({
      children: vine
        .array(
          vine.object({
            childFieldA: vine.string().optional().requiredIfAnyMissing(['childFieldB']),
            childFieldB: vine.string().optional().requiredIfMissing('childFieldA'),
          })
        )
        .nullable()
        .optional(),
    })
  )
})
