import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { VineModel } from '../../../index.js'

class ClassFields extends BaseModel {
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

test.group('Update | Secondary key', async () => {
  class ClassFieldsSecondary extends ClassFields {
    static secondaryKey = ['fieldB']
  }

  test('Nominal case', async () => {
    assertVineEquals(
      vine.lucid(ClassFieldsSecondary, { update: true }),
      vine.object({
        fieldB: vine.string().optional(),
        fieldD: vine.number().nullable().optional(),
      })
    )
  })

  test('Partial', async () => {
    assertVineEquals(
      vine.lucid(ClassFieldsSecondary, { update: true, partial: true }),
      vine.object({
        fieldB: vine.string().optional(),
        fieldD: vine.number().nullable().optional(),
      })
    )
  })

  test('Partial with no excludeUpdate', async () => {
    class ClassFieldsSecondaryNoExcludedUpdates extends ClassFieldsSecondary {
      static override excludeUpdate = []
    }

    assertVineEquals(
      vine.lucid(ClassFieldsSecondaryNoExcludedUpdates, {
        update: true,
        partial: true,
      }),
      vine.object({
        fieldA: vine.string().optional(),
        fieldB: vine.string().optional(),
        fieldC: vine.number().nullable().optional(),
        fieldD: vine.number().nullable().optional(),
      })
    )
  })
})

test.group('Computed | Secondary key', async () => {
  class ClassComputed extends BaseModel {
    static excludeUpdate = ['fieldA', 'fieldC']

    @VineModel(vine.string())
    @column({ isPrimary: true })
    declare fieldA: string

    @VineModel(vine.string())
    @computed()
    get fieldB(): string {
      return this.fieldA
    }
  }

  test('Nominal case', async () => {
    assertVineEquals(
      vine.lucid(ClassComputed),
      vine.object({
        fieldA: vine.string(),
        fieldB: vine.string(),
      })
    )
  })

  test('Update', async () => {
    assertVineEquals(vine.lucid(ClassComputed, { update: true }), vine.object({}))
  })

  test('Partial', async () => {
    assertVineEquals(
      vine.lucid(ClassComputed, { partial: true }),
      vine.object({
        fieldA: vine.string().optional(),
      })
    )
  })
})

test('Primary key only (on model with secondary key)', async () => {
  class ClassFieldsSecondary extends ClassFields {
    static secondaryKey = ['fieldB']
  }

  assertVineEquals(
    vine.lucid(ClassFieldsSecondary, { primaryKey: 'only' }),
    vine.object({
      fieldA: vine.string().optional().requiredIfMissing('fieldB'),
      fieldB: vine.string().optional().requiredIfAnyMissing(['fieldA']),
    })
  )
})
