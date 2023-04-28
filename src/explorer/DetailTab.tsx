import { Divider, Input, Select } from 'antd'
import { useEffect, useState } from 'react'

import type { Definition } from '@/schema'
import { throwError } from '@/utils/error'
import { useExplorerStore, useZedStore } from '@/zustand'

import RelationGrid from './RelationGrid'

const { Search } = Input

type DefTabProps = {
  id: string
  defaultDefinition?: string
  entityId?: string
}

const DetailTab = ({ id, defaultDefinition, entityId }: DefTabProps) => {
  const schema = useZedStore(
    (state) => state.schema ?? throwError('Schema not defined'),
  )
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
    const label = `${definition?.name || 'Tab'}${
      searchId ? `:${searchId}` : ''
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
      label: d.name,
      value: d.name,
    }
  })

  return (
    <>
      <Select
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        placeholder="Definition"
        defaultValue={defaultDefinition}
        onChange={onDefinitionSelect}
        style={{ width: '25%' }}
        options={defs}
        bordered={false}
      />
      <Search
        style={{ width: '25%' }}
        placeholder="Entity Id"
        disabled={searchDisabled}
        defaultValue={entityId}
        onSearch={(id) => setSearchId(id)}
      />
      <Divider style={{ margin: '12px' }} />
      {definition && (
        <RelationGrid entityId={searchId} definition={definition} />
      )}
    </>
  )
}

export default DetailTab
