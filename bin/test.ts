import { assert } from '@japa/assert'
import { expectTypeOf } from '@japa/expect-type'
import { configure, processCLIArgs, run } from '@japa/runner'
import { assertVine } from '../tests/assert_vine.js'

processCLIArgs(process.argv.splice(2))
configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [assert(), expectTypeOf(), assertVine()],
})

run()
