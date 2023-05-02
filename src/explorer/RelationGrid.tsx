import { AppstoreAddOutlined, LinkOutlined } from '@ant-design/icons'
import { Button, Card, Col, List, Row, Space, Tooltip } from 'antd'
import { startCase, upperCase } from 'lodash'
import { FC } from 'react'

import { useDefinitionRelations } from '@/hooks/useGetDefinitionRelations'
import { Definition } from '@/schema'
import { linkStyle } from '@/utils/styles'
import { useExplorerStore, useModalStateStore } from '@/zustand'

import RelationshipList from './RelationshipList'

type RelationGridProd = {
  definition: Definition
  entityId: string | undefined
}

const RelationGrid: FC<RelationGridProd> = ({ definition, entityId }) => {
  const addTab = useExplorerStore.use.addTab()
  const relations = useDefinitionRelations({ definition })
  const triggerAddRelation = useModalStateStore.use.triggerAddRelation()
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
                      <span>{upperCase(relation.name)}</span>
                      <span
                        style={{
                          ...linkStyle,
                          fontStyle: 'italic',
                          fontWeight: 'normal',
                        }}
                        onClick={() =>
                          addTab({
                            defaultDefinition: relation.parent.name,
                          })
                        }
                      >
                        <Tooltip
                          title={`View: ${startCase(relation.parent.name)}`}
                        >
                          [{startCase(relation.parent.name)}]
                        </Tooltip>
                      </span>
                    </Space>
                  </Col>
                  <Col
                    style={{
                      textAlign: 'right',
                      fontWeight: 'normal',
                    }}
                    span={12}
                  >
                    <Tooltip title="Add relation">
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          triggerAddRelation({
                            onSuccess() {
                              console.log('yay')
                            },
                            onCancel() {
                              console.log('cancel')
                            },
                            config: {
                              subjectId: entityId,
                              subjectType: definition,
                              relation: relation.name,
                              resource: relation.parent,
                            },
                          })
                        }
                        icon={<AppstoreAddOutlined />}
                      />
                    </Tooltip>
                  </Col>
                </Row>
              }
            >
              {!entityId || (entityId ?? '')?.trim() === '' ? (
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
