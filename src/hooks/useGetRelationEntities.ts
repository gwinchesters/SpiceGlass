import { Relationship } from '@authzed/authzed-node/dist/src/v1'
import { useEffect, useState } from 'react'

import { Entity, Relation } from '@/schema'
import { throwError } from '@/utils/error'
import { useZedStore } from '@/zustand'

export const useGetRelationEntities = ({
  entity,
  relation,
}: {
  entity: Entity
  relation: Relation
}) => {
  const [spiceClient] = useZedStore((state) => [
    state.spiceClient ?? throwError('Unknown client'),
  ])
  const [relationships, setRelationships] = useState<Relationship[]>()

  useEffect(() => {
    const fetch = async () => {
      const relationships = await relation.lookupRelationsFromEntity(
        entity,
        spiceClient,
      )
      setRelationships(relationships)
    }

    void fetch()
  }, [entity, relation])

  return relationships
}
