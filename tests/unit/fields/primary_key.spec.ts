/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { ClassFields } from '../base.js'

test.group('Primary key', async () => {
  test('keep', async ({ assert }) => {
    assert.vine.equals(
      vine.lucid(ClassFields, { primaryKey: 'keep' }),
      vine.object({
        fieldA: vine.string(),
        fieldB: vine.string(),
        fieldC: vine.number().optional(),
        fieldD: vine.number().nullable(),
      })
    )
  })

  test('only', async ({ assert }) => {
    assert.vine.equals(
      vine.lucid(ClassFields, { primaryKey: 'only' }),
      vine.object({
        fieldA: vine.string(),
      })
    )
  })
})

test.group('Update', async () => {
  test('Keep', async ({ assert }) => {
    assert.vine.equals(
      vine.lucid(ClassFields, { update: true, primaryKey: 'keep' }),
      vine.object({
        fieldA: vine.string(),
        fieldB: vine.string().optional().nullable(),
        fieldD: vine.number().nullable().optional(),
      })
    )
  })

  test('Only', async ({ assert }) => {
    assert.vine.equals(
      vine.lucid(ClassFields, { update: true, primaryKey: 'only' }),
      vine.object({
        fieldA: vine.string(),
      })
    )
  })
})
