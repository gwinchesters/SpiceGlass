import { Card, Input, Select } from 'antd'
import { ChangeEvent, useState } from 'react'

import { Definition } from '@/schema'
import { useExplorerStore, useZedStore } from '@/zustand'

const { Search } = Input

type DefTabProps = {
  id: string
  setLabel: (id: string, label: string) => void
  activeDefinition?: Definition
}

const DetailTab = ({ id, setLabel }: DefTabProps) => {
  const schema = useZedStore((state) => state.schema)
  const [definition, setDefinition] = useExplorerStore((state) => [
    state.definition,
    state.setDefinition,
  ])
  const [searchDisabled, setSearchDisabled] = useState(true)

  const defs = schema?.definitions.map((d) => {
    return {
      label: d.name,
      value: d.name,
    }
  })

  const onDefinitionSelect = (name: string) => {
    setDefinition(schema?.definitions.find((d) => d.name === name))

    setLabel(id, name)
    setSearchDisabled(false)
  }

  const onSearchId = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const entityId = target.value
    if (definition) {
      setLabel(id, `${definition.name}:${entityId}`)
    }
    console.log('Searching for Entity...')
  }

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
        onChange={onSearchId}
      />
      <Card title="Relations"></Card>
    </>
  )
}

export default DetailTab
