/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

type Mutability = 'readOnly' | 'assignOnly' | 'full'

export class Relation {
  /** Can be nested via dot notation path (eg: ['user.mission.city']) */
  name: string

  /** 'assignOnly' accepts deletions : pass `null`. */
  mutability: Mutability

  constructor(name: string, mutability: Mutability) {
    this.name = name
    this.mutability = mutability
  }

  static readOnly(name: string): Relation {
    return new Relation(name, 'readOnly')
  }

  static assignOnly(name: string): Relation {
    return new Relation(name, 'assignOnly')
  }

  static full(name: string): Relation {
    return new Relation(name, 'full')
  }

  copyWithName(newName: string): Relation {
    return new Relation(newName, this.mutability)
  }
}
