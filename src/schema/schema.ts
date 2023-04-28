import { Relationship } from '@authzed/authzed-node/dist/src/v1'

import SpiceClient from '@/services/spice'

import type {
  DefinitionType,
  PermissionType,
  RelationType,
  ResourceType,
  SchemaDefinition,
} from './ast'
import parseSchema from './parser'

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export type Entity = {
  definition: Definition
  id: string
}

export class Resource {
  readonly parent: Relation
  readonly name: string
  readonly relation: string | undefined

  static fromAst(parent: Relation, resource: ResourceType): Resource {
    return new Resource(parent, resource.name, resource.optionalRelation)
  }

  constructor(
    parent: Relation,
    name: string,
    relation: string | undefined = undefined,
  ) {
    this.parent = parent
    this.name = name
    this.relation = relation
  }
}

export class Relation {
  readonly parent: Definition
  readonly name: string
  readonly resources: Resource[]

  static fromAst(definition: Definition, relationType: RelationType): Relation {
    const relation = new Relation(definition, relationType.name)
    relation.resources.push(
      ...relationType.resources.map((r) => Resource.fromAst(relation, r)),
    )
    return relation
  }

  constructor(parent: Definition, name: string, resources: Resource[] = []) {
    this.parent = parent
    this.name = name
    this.resources = resources
  }

  async lookupRelationsFromEntity(
    { definition, id }: Entity,
    client: SpiceClient,
  ): Promise<Relationship[]> {
    const result = await client.runner.readRelationships({
      relationshipFilter: {
        resourceType: this.parent.name,
        optionalResourceId: '',
        optionalRelation: this.name,
        optionalSubjectFilter: {
          subjectType: definition.name,
          optionalSubjectId: id,
        },
      },
    })
    return result.map(({ relationship }) => relationship).filter(notEmpty)
  }
}

export class Permission {
  readonly parent: Definition
  readonly name: string
  readonly expression: string

  static fromAst(
    definition: Definition,
    permission: PermissionType,
  ): Permission {
    return new Permission(definition, permission.name, permission.expression)
  }

  constructor(parent: Definition, name: string, expression: string) {
    this.parent = parent
    this.name = name
    this.expression = expression
  }
}

export class Definition {
  readonly name: string
  readonly relations: Relation[]
  readonly permissions: Permission[]

  static fromAst({ name, relations, permissions }: DefinitionType): Definition {
    const definition = new Definition(name)
    definition.relations.push(
      ...relations.map((r) => Relation.fromAst(definition, r)),
    )
    definition.permissions.push(
      ...permissions.map((p) => Permission.fromAst(definition, p)),
    )
    return definition
  }

  constructor(
    name: string,
    relations: Relation[] = [],
    permissions: Permission[] = [],
  ) {
    this.name = name
    this.relations = relations
    this.permissions = permissions
  }

  createEntity(id: string): Entity {
    return {
      definition: this,
      id,
    }
  }
}

export class Schema {
  readonly definitions: Definition[]
  private definitionMap: Record<string, Definition>
  private reverseRelationMap: Record<string, Relation[]>

  static fromString(schema: string): Schema {
    const parsed = parseSchema(schema)
    return Schema.fromAst(parsed)
  }

  static fromAst(ast: SchemaDefinition): Schema {
    return new Schema(
      ast.definitions.map((definition) => Definition.fromAst(definition)),
    )
  }

  constructor(definitions: Definition[] = []) {
    this.definitions = definitions
    this.definitionMap = definitions.reduce(
      (acc, definition) => ({ ...acc, [definition.name]: definition }),
      {},
    )
    this.reverseRelationMap = definitions.reduce<Record<string, Relation[]>>(
      (acc, definition) => {
        definition.relations.forEach((relation) => {
          relation.resources.forEach((resource) => {
            acc[resource.name].push(relation)
          })
        })
        return {
          ...acc,
        }
      },
      definitions.reduce((acc, def) => ({ ...acc, [def.name]: [] }), {}),
    )
  }

  getDefinitionByName(definitionName: string): Definition | undefined {
    return this.definitionMap[definitionName]
  }

  getRelationsForDefinition(name: string): Relation[] {
    return this.reverseRelationMap[name]
  }
}
