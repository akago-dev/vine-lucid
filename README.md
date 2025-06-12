Declare (vine)[https://docs.adonisjs.com/guides/basics/validation] properties validation in your (lucid)[https://docs.adonisjs.com/guides/database/lucid] model. Generate object validators where it suits you.

# Installation

```sh
node ace add @akago/vine-lucid
```

This will notably install a provider needed to avoid cyclic imports.

# Usage

```ts
import { BaseModel, column } from '@adonisjs/lucid/orm'
import vine from '@vinejs/vine'
import { VineModel } from '@akago/vine-lucid'

export class Kid extends BaseModel {
  @VineModel(vine.string())
  @column()
  declare name: string
}

const schema = vine.lucid(Kid, { update: true })
const data = {
  name: 'John',
  lastname: 'lennon',
}

const output = await vine.validate({ schema, data })

this.logger.info(JSON.stringify(output))
```

See tests for more advanced usage (including relations, cyclic imports, partial, update...)
