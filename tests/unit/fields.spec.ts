import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { VineModel, assertVineEquals } from '../../index.js'

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

test.group('Fields', async () => {
  test('Nominal case', async () => {
    class ClassA extends BaseModel {
      @VineModel(vine.string())
      @column()
      declare fieldA: string
    }

    assertVineEquals(
      vine.lucid(ClassA),
      vine.object({
        fieldA: vine.string(),
      })
    )
  })

  test('Optional', async () => {
    class ClassA extends BaseModel {
      @VineModel(vine.string())
      @column()
      declare fieldA: string

      @VineModel(vine.number().optional())
      @column()
      declare fieldB: number | undefined
    }

    assertVineEquals(
      vine.lucid(ClassA),
      vine.object({
        fieldA: vine.string(),
        fieldB: vine.number().optional(),
      })
    )
  })

  test('Ignore non @VineModel', async () => {
    class ClassA extends BaseModel {
      @VineModel(vine.string())
      @column()
      declare fieldA: string

      @VineModel(vine.number().optional())
      @column()
      declare fieldB: number | undefined

      @column()
      declare fieldC: number | undefined
    }

    assertVineEquals(
      vine.lucid(ClassA),
      vine.object({
        fieldA: vine.string(),
        fieldB: vine.number().optional(),
      })
    )
  })

  test('Enum', async () => {
    enum EnumA {
      value1,
      value2,
    }
    class ClassA extends BaseModel {
      @VineModel(vine.enum(EnumA))
      @column()
      declare fieldA: EnumA
    }

    assertVineEquals(
      vine.lucid(ClassA),
      vine.object({
        fieldA: vine.enum(EnumA),
      })
    )
  })

  test('Enum array', async () => {
    enum EnumA {
      value1,
      value2,
    }
    class ClassA extends BaseModel {
      @VineModel(vine.array(vine.enum(EnumA)))
      @column()
      declare fieldA: EnumA[]
    }

    assertVineEquals(
      vine.lucid(ClassA),
      vine.object({
        fieldA: vine.array(vine.enum(EnumA)),
      })
    )
  })

  test('Partial', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { partial: true }),
      vine.object({
        fieldA: vine.string().optional(),
        fieldB: vine.string().optional(),
        fieldC: vine.number().optional(),
        fieldD: vine.number().nullable().optional(),
      })
    )
  })

  test('Nullable', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { null: true }),
      vine
        .object({
          fieldA: vine.string().nullable(),
          fieldB: vine.string().nullable(),
          fieldC: vine.number().optional().nullable(),
          fieldD: vine.number().nullable(),
        })
        .nullable()
    )
  })
})

test.group('Primary key', async () => {
  test('keep', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { primaryKey: 'keep' }),
      vine.object({
        fieldA: vine.string(),
        fieldB: vine.string(),
        fieldC: vine.number().optional(),
        fieldD: vine.number().nullable(),
      })
    )
  })

  test('only', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { primaryKey: 'only' }),
      vine.object({
        fieldA: vine.string(),
      })
    )
  })

  test('only (on model with secondary key)', async () => {
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
})

test.group('Update', async () => {
  test('Nominal case', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { update: true }),
      vine.object({
        fieldB: vine.string().optional().nullable(),
        fieldD: vine.number().nullable().optional(),
      })
    )
  })

  test('primary key : keep', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { update: true, primaryKey: 'keep' }),
      vine.object({
        fieldA: vine.string(),
        fieldB: vine.string().optional().nullable(),
        fieldD: vine.number().nullable().optional(),
      })
    )
  })

  test('primary key : only', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { update: true, primaryKey: 'only' }),
      vine.object({
        fieldA: vine.string(),
      })
    )
  })
})

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
