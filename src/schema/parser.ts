export interface Resource {
  name: string
  optionalRelation?: string
}

export interface Relation {
  name: string
  resources: Resource[]
}

export interface ExpressionPart {
  type: string
}

export interface RelationExpressionPart {
  type: 'relation'
  name: string
  nestedExpressionPart?: ExpressionPart
}

export interface PermissionExpressionPart {
  type: 'permission'
  name: string
}

export interface OperationExpressionPart {
  type: 'operation'
  operator: '&' | '+' | '-'
  operands: (PermissionExpressionPart | RelationExpressionPart)[]

}

export interface Permission {
  name: string
  expression: string
  expressionParts?: ExpressionPart[]
}

export interface Definition {
  name: string
  relations: Relation[]
  permissions: Permission[]
}

export interface Schema {
  definitions: Definition[]
}

export type RegExpGroups<T extends string> =
  | (RegExpMatchArray & {
      groups?: { [name in T]: string } | { [key: string]: string };
    })
  | null;

const identifierRegex = '[a-zA-Z_0-9]+'
const permissionOperatorsRegex = '[+&-]'
const permissionNestedOpRegex = `->${identifierRegex}`
const relationTypeRegex = `${identifierRegex}(#${identifierRegex})?`

const definitionRegex = new RegExp(`definition\\s*(?<name>${identifierRegex})\\s*{s*((?<inline>.*)})?`)
const relationRegex = new RegExp(`(?<relation>(relation\\s(?<name>${identifierRegex}):\\s+(?<type>(${relationTypeRegex}(\\s*[|]\\s*)?)+)\\s*?))+`, 'g')
const typeRegex = new RegExp(`(((?<type>${identifierRegex})(#(?<relation>${identifierRegex}))?))+`, 'g')
const permissionRegex = new RegExp(`permission\\s+(?<name>${identifierRegex})\\s*=\\s*(?<expression>(((\\s*${permissionOperatorsRegex}\\s*)?${identifierRegex}(${permissionNestedOpRegex})?))+)`, 'g')
const permissionExpressionRegex = new RegExp(`(?<type>([a-zA-Z_0-9]+(?<nested>->[a-zA-Z_0-9]+)?)(\\s*(?<operator>[+&-])\\s*)?)`, 'g')

function parseRelations(relation: string): Relation[] {
  const relations: Relation[] = []
  const relationMatches: RegExpGroups<'name' | 'type'>[] = [...relation.matchAll(relationRegex)]
  for (const relation of relationMatches) {
    if (!relation?.groups) {
      continue
    }
  
    const { groups: { name, type } } = relation
    const resources: Resource[] = type.trim().split('|').map((it) => {
      const matches: RegExpGroups<'relation' | 'type'>[] = [...it.trim().matchAll(typeRegex)]
      if (!matches.length) {
        throw Error("blah")
      }
  
      const [match] = matches
      if (!match || !match.groups) {
        throw Error("blah")
      }
  
      return {
        name: match.groups.type,
        optionalRelation: match.groups.relation
      }
    })
  
    relations.push({
      name,
      resources,
    })
  }
  
  return relations
}

function parsePermissions(permission: string): Permission[] {
  const permissions: Permission[] = []
  const permissionMatches: RegExpGroups<'name' | 'expression'>[] = [...permission.matchAll(permissionRegex)]
  for (const permission of permissionMatches) {
    if (!permission?.groups) {
      continue
    }

    const { groups: { name, expression }} = permission
    const expressionMatches: RegExpGroups<'type' | 'nested' | 'operator'>[] = [...expression.matchAll(permissionExpressionRegex)]
    if (!expressionMatches.length) {
      throw Error(`Invalid expression found (permission=${name}): ${expression}`)
    }

    for (const expressionMatch of expressionMatches) {
      if (!expressionMatch?.groups) {
        continue
      }

      
    }

    permissions.push({
      name: permission.groups.name,
      expression: permission.groups.expression,
    })
  }
  
  return permissions
}


function parseSchema(schemaString: string): Schema {
  const schema: Schema = { definitions: [] }
  const lines = schemaString.split(/\s*\n\s*/).filter((line) => line.trim() !== '')

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]
    if (!line.startsWith('definition')) {
      i++
      continue
    }

    const typeMatch: RegExpGroups<'inline' | 'name'> = line.match(definitionRegex)
    if (!typeMatch || !typeMatch.groups) {
      throw new Error(`Invalid definition syntax at line ${i+1}`);
    }

    const { groups: { inline: body, name }} = typeMatch
    const definition: Definition = { name, relations: [], permissions: [] }
    
    if (body) {
      parseRelations(body).forEach((relation) => {
        definition.relations.push(relation)
      })
      parsePermissions(body).forEach((permission) => {
        definition.permissions.push(permission)
      })
    } else {
      if (!line.endsWith('}')) {
        while (i < lines.length - 1 && !lines[i+1].startsWith('}')) {
          const propertyline = lines[++i].trim()
          parseRelations(propertyline).forEach((relation) => {
            definition.relations.push(relation)
          })
          parsePermissions(propertyline).forEach((permission) => {
            definition.permissions.push(permission)
          })
        }
      }
    }
    schema.definitions.push(definition)
    i++
  }

  return schema
}

export default parseSchema