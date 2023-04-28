import { Card, Input, Select } from 'antd'
import { useEffect, useState } from 'react'

import { Definition } from '@/schema'
import { useExplorerStore, useZedStore } from '@/zustand'

const { Search } = Input

type DefTabProps = {
  id: string
  defaultDefinition?: string
}

const DetailTab = ({ id, defaultDefinition }: DefTabProps) => {
  const schema = useZedStore((state) => state.schema)
  const updateLabel = useExplorerStore((state) => state.updateLabel)
  const [definition, setDefinition] = useState<Definition | undefined>(
    schema?.definitions.find((d) => d.name === defaultDefinition),
  )
  const [searchId, setSearchId] = useState<string>()
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
    setDefinition(schema?.definitions.find((d) => d.name === name))
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
        placeholder="Definition"
        defaultValue={definition?.name}
        onChange={onDefinitionSelect}
        style={{ width: '25%' }}
        options={defs}
        bordered={false}
      />
      <Search
        style={{ width: '25%' }}
        placeholder="Entity Id"
        disabled={searchDisabled}
        onSearch={(id) => setSearchId(id)}
      />
      <Card title="Relations"></Card>
    </>
  )
}

export default DetailTab
