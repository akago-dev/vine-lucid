/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Assert } from '@japa/assert'
import vine, { BaseModifiersType } from '@vinejs/vine'
import assert from 'node:assert'

declare module '@japa/assert' {
  interface Assert {
    vine: {
      equals<Input, Output, CamelCaseOutput>(
        schemaA: BaseModifiersType<Input, Output, CamelCaseOutput>,
        schemaB: BaseModifiersType<Input, Output, CamelCaseOutput>
      ): void
    }
  }
}

export const assertVine = () =>
  function () {
    Assert.macro('vine', {
      equals: function <Input, Output, CamelCaseOutput>(
        schemaA: BaseModifiersType<Input, Output, CamelCaseOutput>,
        schemaB: BaseModifiersType<Input, Output, CamelCaseOutput>
      ): void {
        // We can't test equality of refs as they contain functions
        // So we just make sure their names match
        const cleanJson = ({ refs, ...obj }: any) => ({ ...obj, refs: Object.keys(refs) })

        const jsonA = cleanJson(vine.compile(schemaA).toJSON())
        const jsonB = cleanJson(vine.compile(schemaB).toJSON())
        assert.notEqual(jsonA, null)
        assert.deepEqual(jsonA, jsonB)
      },
    })
  }
