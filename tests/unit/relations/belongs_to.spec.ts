/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { Relation, VineModel } from '../../../index.js'
import '../../assert_vine.js'
import { Child } from '../base.js'

class Parent extends BaseModel {
  static excludeFromUpdate = ['fieldA', 'fieldC']

  @VineModel(vine.string())
  @column({ isPrimary: true })
  declare fieldA: string

  @VineModel(vine.lucid(Child, { partial: true, null: true }), Child)
  @belongsTo(() => Child)
  declare child: BelongsTo<typeof Child>
}

test('No relation', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(Parent),
    vine.object({
      fieldA: vine.string(),
    })
  )
})

test('Relation | mutability readOnly', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(Parent, {
      relations: [Relation.readOnly('child')],
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

test('Relation | mutability readOnly | update', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(Parent, {
      relations: [Relation.readOnly('child')],
      update: true,
    }),
    vine.object({})
  )
})

test('Relation | mutability full', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(Parent, {
      relations: [Relation.full('child')],
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

test('Relation | mutability full | update', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(Parent, {
      relations: [Relation.full('child')],
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

test('Relation | mutability assignOnly ', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(Parent, {
      relations: [Relation.assignOnly('child')],
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

test('Relation | mutability assignOnly | update', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(Parent, {
      relations: [Relation.assignOnly('child')],
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
