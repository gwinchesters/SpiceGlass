import { Relationship } from '@authzed/authzed-node/dist/src/v1'
import { List } from 'antd'
import { startCase } from 'lodash'
import { type FC, useCallback, useEffect, useState } from 'react'

import { useGetRelationEntities } from '@/hooks/useGetRelationEntities'
import { Entity, Relation } from '@/schema'
import { linkStyle } from '@/utils/styles'
import { useExplorerStore } from '@/zustand'

type RelationshipListConfig = {
  relation: Relation
  entity: Entity
}

type PaginationParams = {
  page: number
  size: number
}

const RelationshipList: FC<RelationshipListConfig> = ({ relation, entity }) => {
  const addTab = useExplorerStore.use.addTab()

  const [relationships, loading] = useGetRelationEntities({
    relation,
    entity,
  })
  const [pagedItems, setPagedItems] = useState<Relationship[]>([])
  const [pageParams, setPageParams] = useState<PaginationParams>({
    page: 1,
    size: 10,
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

  useEffect(() => {
    if (relationships?.length) {
      const { page, size } = pageParams
      const startOfPage = (page - 1) * size
      setPagedItems(relationships?.slice(startOfPage, startOfPage + size))
    }
  }, [relationships, pageParams])

  const onPageSelect = (page: number, size: number) => {
    if (!relationships?.length) {
      return
    }

    setPageParams({ page, size })
  }

  return loading ? (
    <>Loading...</>
  ) : (
    <List
      size="small"
      dataSource={relationships ? pagedItems : undefined}
      loading={loading}
      itemLayout="horizontal"
      pagination={{
        defaultCurrent: 1,
        current: pageParams.page,
        size: 'small',
        pageSize: pageParams.size,
        position: 'bottom',
        hideOnSinglePage: true,
        align: 'center',
        total: relationships?.length ?? 0,
        onChange: onPageSelect,
      }}
      renderItem={(item: Relationship) => (
        <List.Item style={{ padding: '4px 8px' }}>
          <span
            style={{ ...linkStyle }}
            onClick={() => onRelationshipClick(item)}
          >
            {startCase(item.resource?.objectType)}: {item.resource?.objectId}
          </span>
        </List.Item>
      )}
    ></List>
  )
}

export default RelationshipList
