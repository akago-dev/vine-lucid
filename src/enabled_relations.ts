type EnabledRelationMutability = 'readOnly' | 'assignOnly' | 'full'

export class EnabledRelation {
  /** Can be nested via dot notation path (eg: ['user.mission.city']) */
  name: string

  /** 'assignOnly' accepts deletions : pass `null`. */
  mutability: EnabledRelationMutability

  constructor(name: string, mutability: EnabledRelationMutability) {
    this.name = name
    this.mutability = mutability
  }

  static readOnly(name: string): EnabledRelation {
    return new EnabledRelation(name, 'readOnly')
  }

  static assignOnly(name: string): EnabledRelation {
    return new EnabledRelation(name, 'assignOnly')
  }

  static full(name: string): EnabledRelation {
    return new EnabledRelation(name, 'full')
  }

  copyWithName(newName: string): EnabledRelation {
    return new EnabledRelation(newName, this.mutability)
  }
}
