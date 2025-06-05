/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { EnabledRelation, VineModel } from '../../../index.js'
import { Child } from '../base.js'

class Parent extends BaseModel {
  static excludeUpdate = ['fieldA', 'fieldC']

  @VineModel(vine.string())
  @column({ isPrimary: true })
  declare fieldA: string

  @VineModel(vine.array(vine.lucid(Child, { partial: true, null: true })), Child)
  @manyToMany(() => Child)
  declare children: ManyToMany<typeof Child>
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

test('Relation | mutability readOnly | update', async ({ assert }) => {
  assert.vine.equals(
    vine.lucid(Parent, {
      relations: [EnabledRelation.readOnly('children')],
      update: true,
    }),
    vine.object({})
  )
})

test('Relation | mutability full', async ({ assert }) => {
  assert.vine.equals(
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

test('Relation | mutability full | update', async ({ assert }) => {
  assert.vine.equals(
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

test('Relation | mutability assignOnly ', async ({ assert }) => {
  assert.vine.equals(
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

test('Relation | mutability assignOnly | update', async ({ assert }) => {
  assert.vine.equals(
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
