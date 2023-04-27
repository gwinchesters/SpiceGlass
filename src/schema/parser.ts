export interface Resource {
  name: string
  optionalRelation?: string
}

export interface Relation {
  name: string
  resources: Resource[]
}

export interface Definition {
  name: string
  relations: Relation[]
}

export interface Schema {
  definitions: Definition[]
}

export type RegExpGroups<T extends string> =
  | (RegExpMatchArray & {
      groups?: { [name in T]: string } | { [key: string]: string };
    })
  | null;

const definitionNameRegex = '[a-zA-Z_]+'
const relationNameRegex = '[a-zA-Z_]+'
const relationTypeNameRegex = '[a-zA-Z_]+'
const relationTypeRelationRegex = '[a-zA-Z_]+'
const relationTypeRegex = `${relationTypeNameRegex}(#${relationTypeRelationRegex})?`

const definitionRegex = new RegExp(`definition\\s*(?<name>${definitionNameRegex})\\s*{s*((?<inline>.*)})?`)
const regex = new RegExp(`(?<relation>(relation\\s(?<name>${relationNameRegex}):\\s+(?<type>(${relationTypeRegex}(\\s*[|]\\s*)?)+)\\s*?))+`, 'g')
const typeRegex = new RegExp(`(((?<type>${relationTypeNameRegex})(#(?<relation>${relationTypeRelationRegex}))?))+`, 'g')

function parseRelations(relation: string): Relation[] {
  const relations: Relation[] = []
  const relationMatches = [...relation.matchAll(regex)]
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
    const definition: Definition = { name, relations: [] }
    
    if (body) {
      parseRelations(body).forEach((relation) => {
        definition.relations.push(relation)
      })
    } else {
      if (!line.endsWith('}')) {
        while (i < lines.length - 1 && !lines[i+1].startsWith('}')) {
          const propertyline = lines[++i].trim()
          parseRelations(propertyline).forEach((relation) => {
            definition.relations.push(relation)
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