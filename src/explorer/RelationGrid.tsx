import { LinkOutlined } from '@ant-design/icons'
import { Card, Col, List, Row, Space } from 'antd'
import { startCase } from 'lodash'
import { FC } from 'react'

import { useDefinitionRelations } from '@/hooks/useGetDefinitionRelations'
import { Definition } from '@/schema'

import RelationshipList from './RelationshipList'

type RelationGridProd = {
  definition: Definition
  entityId: string | undefined
}

const RelationGrid: FC<RelationGridProd> = ({ definition, entityId }) => {
  const relations = useDefinitionRelations({ definition })
  return (
    <div style={{ paddingLeft: '1em', paddingRight: '1em' }}>
      <h2>Relations</h2>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
        dataSource={relations}
        renderItem={(relation) => (
          <List.Item>
            <Card
              size="small"
              headStyle={{ backgroundColor: '#c9c9c9' }}
              title={
                <Row>
                  <Col style={{ textAlign: 'left' }} span={12}>
                    <Space>
                      <LinkOutlined style={{ color: '#00474f' }} />
                      {startCase(relation.name)}
                    </Space>
                  </Col>
                  <Col
                    style={{
                      textAlign: 'right',
                      fontWeight: 'normal',
                      fontStyle: 'italic',
                    }}
                    span={12}
                  >
                    {startCase(relation.parent.name)}
                  </Col>
                </Row>
              }
            >
              {entityId === undefined ? (
                <>Select entity to continue</>
              ) : (
                <RelationshipList
                  relation={relation}
                  entity={definition.createEntity(entityId)}
                />
              )}
            </Card>
          </List.Item>
        )}
      />
    </div>
  )
}

export default RelationGrid
