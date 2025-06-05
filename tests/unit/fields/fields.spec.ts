import { BaseModel, column } from '@adonisjs/lucid/orm'
import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { VineModel, assertVineEquals } from '../../../index.js'
import { ClassFields } from '../base.js'

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

test('Update', async () => {
  assertVineEquals(
    vine.lucid(ClassFields, { update: true }),
    vine.object({
      fieldB: vine.string().optional().nullable(),
      fieldD: vine.number().nullable().optional(),
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
