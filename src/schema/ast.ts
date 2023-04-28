export type RegExpGroups<T extends string> =
  | (RegExpMatchArray & {
      groups?: { [name in T]: string } | { [key: string]: string }
    })
  | null

export interface ResourceType {
  name: string
  optionalRelation?: string
}

export interface RelationType {
  name: string
  resources: ResourceType[]
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

export interface PermissionType {
  name: string
  expression: string
  expressionParts?: ExpressionPart[]
}

export interface DefinitionType {
  name: string
  relations: RelationType[]
  permissions: PermissionType[]
}

export interface SchemaDefinition {
  definitions: DefinitionType[]
}
