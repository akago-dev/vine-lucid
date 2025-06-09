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
import vine from '@vinejs/vine'
import { VineModel } from '../../../index.js'
import '../../assert_vine.js'
import { ClassA } from './class_a.js'

export class ClassB extends BaseModel {
  @VineModel(vine.string())
  @column()
  declare name: string

  @VineModel(() => vine.lucid(ClassA), () => ClassA)
  @belongsTo(() => ClassA)
  declare otherA: BelongsTo<typeof ClassA>
}
