import { Definition, Relation } from '@/schema'
import { throwError } from '@/utils/error'
import { useZedStore } from '@/zustand'

export const useDefinitionRelations = ({
  definition,
}: {
  definition: Definition
}): Relation[] => {
  const schema = useZedStore(
    (state) => state.schema ?? throwError('Unknown schema'),
  )

  return schema.getRelationsForDefinition(definition.name)
}
