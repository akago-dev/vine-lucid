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

class Child extends BaseModel {
  static excludeUpdate = ['childFieldA']

  @VineModel(vine.string())
  @column({ isPrimary: true })
  declare childFieldA: string

  @VineModel(vine.string())
  @column()
  declare childFieldB: string
}

test.group('Belongs to', async () => {
  class Parent extends BaseModel {
    static excludeUpdate = ['fieldA', 'fieldC']

    @VineModel(vine.string())
    @column({ isPrimary: true })
    declare fieldA: string

    @VineModel(vine.lucid(Child, { partial: true, null: true }), Child)
    @belongsToWithIdColumn(() => Child)
    declare child: BelongsTo<typeof Child>
  }

  test('No relation', async () => {
    assertVineEquals(
      vine.lucid(Parent),
      vine.object({
        fieldA: vine.string(),
      })
    )
  })

  test('Relation | mutability readOnly', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.readOnly('child')],
      }),
      vine.object({
        fieldA: vine.string(),
        child: vine
          .object({
            childFieldA: vine.string(),
            childFieldB: vine.string(),
          })
          .nullable(),
      })
    )
  })

  test('Relation | mutability readOnly | update', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.readOnly('child')],
        update: true,
      }),
      vine.object({})
    )
  })

  test('Relation | mutability full', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.full('child')],
      }),
      vine.object({
        fieldA: vine.string(),
        child: vine
          .object({
            childFieldA: vine.string(),
            childFieldB: vine.string(),
          })
          .nullable(),
      })
    )
  })

  test('Relation | mutability full | update', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.full('child')],
        update: true,
      }),
      vine.object({
        child: vine
          .object({
            childFieldA: vine.string().optional(),
            childFieldB: vine.string().optional().nullable(),
          })
          .nullable()
          .optional(),
      })
    )
  })

  test('Relation | mutability assignOnly ', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.assignOnly('child')],
      }),
      vine.object({
        fieldA: vine.string(),
        child: vine
          .object({
            childFieldA: vine.string(),
            childFieldB: vine.string(),
          })
          .nullable(),
      })
    )
  })

  test('Relation | mutability assignOnly | update', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.assignOnly('child')],
        update: true,
      }),
      vine.object({
        child: vine
          .object({
            childFieldA: vine.string(),
          })
          .nullable()
          .optional(),
      })
    )
  })
})

test.group('Many to many', async () => {
  class Parent extends BaseModel {
    static excludeUpdate = ['fieldA', 'fieldC']

    @VineModel(vine.string())
    @column({ isPrimary: true })
    declare fieldA: string

    @VineModel(vine.array(vine.lucid(Child, { partial: true, null: true })), Child)
    @manyToMany(() => Child)
    declare children: ManyToMany<typeof Child>
  }

  test('No relation', async () => {
    assertVineEquals(
      vine.lucid(Parent),
      vine.object({
        fieldA: vine.string(),
      })
    )
  })

  test('Relation | mutability readOnly', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.readOnly('children')],
      }),
      vine.object({
        fieldA: vine.string(),
        children: vine.array(
          vine.object({
            childFieldA: vine.string(),
            childFieldB: vine.string(),
          })
        ),
      })
    )
  })

  test('Relation | mutability readOnly | update', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.readOnly('children')],
        update: true,
      }),
      vine.object({})
    )
  })

  test('Relation | mutability full', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.full('children')],
      }),
      vine.object({
        fieldA: vine.string(),
        children: vine.array(
          vine.object({
            childFieldA: vine.string(),
            childFieldB: vine.string(),
          })
        ),
      })
    )
  })

  test('Relation | mutability full | update', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.full('children')],
        update: true,
      }),
      vine.object({
        children: vine
          .array(
            vine.object({
              childFieldA: vine.string().optional(),
              childFieldB: vine.string().optional().nullable(),
            })
          )
          .nullable()
          .optional(),
      })
    )
  })

  test('Relation | mutability assignOnly ', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.assignOnly('children')],
      }),
      vine.object({
        fieldA: vine.string(),
        children: vine.array(
          vine.object({
            childFieldA: vine.string(),
            childFieldB: vine.string(),
          })
        ),
      })
    )
  })

  test('Relation | mutability assignOnly | update', async () => {
    assertVineEquals(
      vine.lucid(Parent, {
        relations: [EnabledRelation.assignOnly('children')],
        update: true,
      }),
      vine.object({
        children: vine
          .array(
            vine.object({
              childFieldA: vine.string(),
            })
          )
          .nullable()
          .optional(),
      })
    )
  })
})
