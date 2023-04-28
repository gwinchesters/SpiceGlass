import { Relationship } from '@authzed/authzed-node/dist/src/v1'
import { List } from 'antd'
import { type FC, useCallback } from 'react'

import { useGetRelationEntities } from '@/hooks/useGetRelationEntities'
import { Entity, Relation } from '@/schema'
import { useExplorerStore } from '@/zustand'

type RelationshipListConfig = {
  relation: Relation
  entity: Entity
}

const RelationshipList: FC<RelationshipListConfig> = ({ relation, entity }) => {
  const addTab = useExplorerStore.use.addTab()

  const relationships = useGetRelationEntities({
    relation,
    entity,
  })

  const onRelationshipClick = useCallback(
    ({ resource }: Relationship) => {
      if (resource) {
        addTab({
          defaultDefinition: resource.objectType,
          entityId: resource.objectId,
        })
      }
    },
    [addTab],
  )

  return !relationships ? (
    <>Loading...</>
  ) : (
    <List
      size="small"
      dataSource={relationships}
      renderItem={(item: Relationship) => (
        <List.Item>
          <a href="#" onClick={() => onRelationshipClick(item)}>
            {item.resource?.objectId}
          </a>
        </List.Item>
      )}
    ></List>
  )
}

export default RelationshipList
