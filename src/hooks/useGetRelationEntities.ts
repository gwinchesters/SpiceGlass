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
}): [Relationship[] | undefined, boolean] => {
  const [spiceClient] = useZedStore((state) => [
    state.spiceClient ?? throwError('Unknown client'),
  ])
  const [relationships, setRelationships] = useState<Relationship[]>()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const relationships = await relation.lookupRelationsFromEntity(
        entity,
        spiceClient,
      )
      setRelationships(relationships)
      setLoading(false)
    }

    if (entity?.id?.trim() !== '') {
      void fetch()
    }
  }, [entity, relation, setLoading])

  return [relationships, loading]
}
