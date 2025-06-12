Declare vine properties validation in your lucid model. Generate object validators where it suits you.

# Installation

```sh
node ace add @akago/vine-lucid
```

This will notably install a provider needed to avoid cyclic imports.

It will also make sure (lucid)[https://docs.adonisjs.com/guides/database/lucid#installation] and (vine)[https://docs.adonisjs.com/guides/basics/validation#configuring-vinejs] are installed.

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

const schema = vine.lucid(Kid)
const data = {
  name: 'John',
}

const output = await vine.validate({ schema, data })
```

See tests for more advanced usage (including relations, cyclic imports, partial, update...)
