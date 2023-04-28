import type { SchemaDefinition } from './ast'
import parseSchema from './parser'

export class Resource {
  readonly name: string
  readonly relation: string | undefined

  constructor(name: string, relation: string | undefined = undefined) {
    this.name = name
    this.relation = relation
  }
}

export class Relation {
  readonly name: string
  readonly resources: Resource[]

  constructor(name: string, resources: Resource[]) {
    this.name = name
    this.resources = resources
  }
}

export class Permission {
  readonly name: string
  readonly expression: string

  constructor(name: string, expression: string) {
    this.name = name
    this.expression = expression
  }
}

export class Definition {
  readonly name: string
  readonly relations: Relation[]
  readonly permissions: Permission[]

  constructor(name: string, relations: Relation[], permissions: Permission[]) {
    this.name = name
    this.relations = relations
    this.permissions = permissions
  }
}

export class Schema {
  readonly definitions: Definition[]
  readonly definitionMap: Record<string, Definition>
  
  static fromString(schema: string): Schema {
    const parsed = parseSchema(schema)
    return Schema.fromAst(parsed)
  }

  static fromAst(ast: SchemaDefinition): Schema {
    return new Schema(
      ast.definitions.map(({ name, relations, permissions }) => new Definition(
        name,
        relations.map((r) => new Relation(r.name, r.resources.map((res) => new Resource(res.name, res.optionalRelation)))),
        permissions.map((p) => new Permission(p.name, p.expression))
      ))
    )
  }

  constructor(definitions: Definition[]) {
    this.definitions = definitions
    this.definitionMap = definitions.reduce((acc, definition) => ({ [definition.name]: definition}), {})
  }
}
