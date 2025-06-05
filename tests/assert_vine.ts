import { Assert } from '@japa/assert'
import vine, { BaseModifiersType } from '@vinejs/vine'
import assert from 'assert'

declare module '@japa/assert' {
  interface Assert {
    vineEquals<Input, Output, CamelCaseOutput>(
      schemaA: BaseModifiersType<Input, Output, CamelCaseOutput>,
      schemaB: BaseModifiersType<Input, Output, CamelCaseOutput>
    ): void
  }
}

export const assertVine = () =>
  function () {
    Assert.macro('vineEquals', function <
      Input,
      Output,
      CamelCaseOutput,
    >(schemaA: BaseModifiersType<Input, Output, CamelCaseOutput>, schemaB: BaseModifiersType<Input, Output, CamelCaseOutput>): void {
      // We can't test equality of refs as they contain functions
      // So we just make sure their names match
      const cleanJson = ({ refs, ...obj }: any) => ({ ...obj, refs: Object.keys(refs) })

      const jsonA = cleanJson(vine.compile(schemaA).toJSON())
      const jsonB = cleanJson(vine.compile(schemaB).toJSON())
      assert.notEqual(jsonA, null)
      assert.deepEqual(jsonA, jsonB)
    })
  }
