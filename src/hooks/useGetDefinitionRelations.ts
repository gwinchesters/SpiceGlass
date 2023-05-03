import { useMemo } from 'react'

import { Definition, Relation } from '@/schema'
import { throwError } from '@/utils/error'
import { useZedStore } from '@/zustand'

export const useDefinitionRelations = ({
  definition,
}: {
  definition: Definition
}): Relation[] => {
  const [schema, lastUpdate] = useZedStore((state) => [
    state.schema ?? throwError('Unknown schema'),
    state.lastUpdate,
  ])

  return useMemo(() => {
    return schema.getRelationsForDefinition(definition.name)
  }, [schema, lastUpdate])
}
