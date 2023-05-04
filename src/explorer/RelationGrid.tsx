import { AppstoreAddOutlined, LinkOutlined } from '@ant-design/icons'
import { Button, Card, Col, List, Row, Space, Tooltip } from 'antd'
import { startCase, upperCase } from 'lodash'
import { FC } from 'react'

import { useDefinitionRelations } from '@/hooks/useGetDefinitionRelations'
import { Definition } from '@/schema'
import { explorerStyle, linkStyle } from '@/utils/styles'
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
    <div
      style={{
        paddingTop: '.5em',
        paddingLeft: '1em',
        paddingRight: '1em',
      }}
    >
      <h3 style={{ color: '#002329' }}>RELATIONS</h3>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
        dataSource={relations}
        renderItem={(relation) => (
          <List.Item>
            <Card
              size="small"
              headStyle={{ backgroundColor: '#00474f' }}
              title={
                <Row>
                  <Col style={{ textAlign: 'left' }} span={12}>
                    <Space>
                      <LinkOutlined style={{ color: explorerStyle.color }} />
                      <span style={{ color: explorerStyle.color }}>
                        {upperCase(relation.name)}
                      </span>
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
                            config: {
                              subjectId: entityId,
                              subjectType: definition,
                              relation: relation.name,
                              resource: relation.parent,
                            },
                          })
                        }
                        icon={<AppstoreAddOutlined />}
                        style={{ ...linkStyle }}
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
