import { AppstoreAddOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Input, Row, Select, Space, Tooltip } from 'antd'
import { startCase } from 'lodash'
import { useEffect, useState } from 'react'

import type { Definition } from '@/schema'
import { throwError } from '@/utils/error'
import { explorerStyle, linkStyle } from '@/utils/styles'
import { useExplorerStore, useModalStateStore, useZedStore } from '@/zustand'

import RelationGrid from './RelationGrid'

const { Search } = Input

type DefTabProps = {
  id: string
  defaultDefinition?: string
  entityId?: string
}

const DetailTab = ({ id, defaultDefinition, entityId }: DefTabProps) => {
  const [schema, triggerRefresh] = useZedStore((state) => [
    state.schema ?? throwError('Schema not defined'),
    state.triggerRefresh,
  ])
  const triggerCheckPermission = useModalStateStore.use.triggerCheckPermission()
  const updateLabel = useExplorerStore((state) => state.updateLabel)
  const [definition, setDefinition] = useState<Definition | undefined>(
    defaultDefinition
      ? schema.getDefinitionByName(defaultDefinition)
      : undefined,
  )
  const [searchId, setSearchId] = useState<string | undefined>(
    entityId ?? undefined,
  )
  const [searchDisabled, setSearchDisabled] = useState(true)

  useEffect(() => {
    const label = `${startCase(definition?.name) || 'Tab'}${
      searchId ? `: ${searchId}` : ''
    }`
    updateLabel(id, label)
  }, [updateLabel, id, definition, searchId])

  useEffect(() => {
    setSearchDisabled(!definition)
  }, [setSearchDisabled, definition])

  const onDefinitionSelect = (name: string) => {
    setDefinition(schema.getDefinitionByName(name))
  }

  const defs = schema?.definitions.map((d) => {
    return {
      label: startCase(d.name),
      value: d.name,
    }
  })

  return (
    <section
      style={{
        paddingTop: '.5em',
        height: '100%',
        backgroundColor: explorerStyle.contentBackgroundColor,
        margin: '.5em',
        borderRadius: '.5em',
      }}
    >
      <Row style={{ paddingLeft: '1em', paddingRight: '1em' }}>
        <Col span={8}>
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Definition"
            defaultValue={defaultDefinition}
            onChange={onDefinitionSelect}
            style={{
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '5px',
            }}
            options={defs}
            bordered={false}
          />
        </Col>
        <Col span={8} offset={2}>
          <Search
            style={{ width: '100%' }}
            placeholder="Entity Id"
            disabled={searchDisabled}
            defaultValue={entityId}
            onSearch={(id) => setSearchId(id)}
          />
        </Col>
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Space>
            <Tooltip title="Add relation">
              <Button
                type="primary"
                onClick={() =>
                  triggerCheckPermission({
                    config: {
                      subjectId: searchId,
                      subjectType: definition,
                    },
                  })
                }
              >
                Check
              </Button>
            </Tooltip>
            <Tooltip title="Add relation">
              <Button type="default" onClick={() => triggerRefresh()}>
                Refresh
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>
      <Divider style={{ margin: '12px' }} />
      {definition && (
        <RelationGrid entityId={searchId} definition={definition} />
      )}
    </section>
  )
}

export default DetailTab
