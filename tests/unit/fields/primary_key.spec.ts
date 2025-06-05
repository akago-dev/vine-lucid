import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { assertVineEquals } from '../../../index.js'
import { ClassFields } from '../base.js'

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
})

test.group('Update', async () => {
  test('Keep', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { update: true, primaryKey: 'keep' }),
      vine.object({
        fieldA: vine.string(),
        fieldB: vine.string().optional().nullable(),
        fieldD: vine.number().nullable().optional(),
      })
    )
  })

  test('Only', async () => {
    assertVineEquals(
      vine.lucid(ClassFields, { update: true, primaryKey: 'only' }),
      vine.object({
        fieldA: vine.string(),
      })
    )
  })
})
