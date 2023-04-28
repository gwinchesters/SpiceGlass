import { Input, Select, Space, Tree, Typography } from 'antd'
import { useState } from 'react'

import { useZedStore } from '@/zustand'
const { Search } = Input
const { Text } = Typography

const SchemaSearch = () => {
  const schema = useZedStore((state) => state.schema)
  const [schemaDefinitions] = useState(
    schema?.definitions.map((d, i) => {
      return {
        key: i,
        title: d.name,
      }
    }),
  )
  const savedTabs = [
    {
      label: 'User',
      options: [{ label: 'No Saved Tabs', value: null, disabled: true }],
    },
    {
      label: 'Platform',
      options: [{ label: 'No Saved Tabs', value: null, disabled: true }],
    },
  ]

  const onSelectSavedTab = (value: string) => {
    console.log(`Opening saved tab: ${value}`)
  }

  return (
    <>
      <Space direction="vertical" style={{ margin: 10 }}>
        <Text strong>SCHEMA</Text>
        <Select
          placeholder="Saved Tabs"
          onChange={onSelectSavedTab}
          style={{ width: '100%' }}
          options={savedTabs}
        />
        <Search style={{}} placeholder="Search" />
        <Tree treeData={schemaDefinitions} />
      </Space>
    </>
  )
}

export default SchemaSearch
