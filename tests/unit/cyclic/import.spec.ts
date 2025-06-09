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
import { EnabledRelation } from '../../../index.js'
import VineModelProvider from '../../../src/provider.js'
import { ClassA } from './class_a.js'
import { ClassB } from './class_b.js'

test('Base field', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(ClassA),
    vine.object({
      name: vine.string(),
    })
  )
  assert.vine.equals(
    vine.lucid(ClassB),
    vine.object({
      name: vine.string(),
    })
  )
})

test('Relations', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(ClassA, {
      relations: [EnabledRelation.full('otherB')],
    }),
    vine.object({
      name: vine.string(),
      otherB: vine
        .object({
          name: vine.string(),
        })
        .nullable(),
    })
  )
})
  .setup(new VineModelProvider().register)
  .pin()
