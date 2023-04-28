import { Button, Input, List, Select, Space, Typography } from 'antd'
import { useState } from 'react'

import { useExplorerStore, useZedStore } from '@/zustand'
const { Search } = Input
const { Text } = Typography

const SchemaSearch = () => {
  const schema = useZedStore((state) => state.schema)
  const addTab = useExplorerStore((state) => state.addTab)
  const [filter, setFilter] = useState<string>()

  const onSelectSavedTab = (value: string) => {
    // TODO: implement saved tabs
    console.log(`Opening saved tab: ${value}`)
  }

  const definitions = schema?.definitions.reduce<string[]>((acc, d) => {
    if (filter && !d.name.includes(filter)) {
      return acc
    }
    return [...acc, d.name]
  }, [])

  return (
    <>
      <Space direction="vertical" style={{ margin: 10 }}>
        <Text style={{ color: '#d9d9d9' }} strong>
          SCHEMA
        </Text>
        <Select
          placeholder="Saved Tabs"
          onChange={onSelectSavedTab}
          style={{ width: '100%' }}
          options={[]}
        />
        <Search
          style={{}}
          placeholder="Search"
          onSearch={(value) => setFilter(value)}
        />
        <List
          dataSource={definitions}
          renderItem={(item) => (
            <List.Item>
              <Button
                type="text"
                onClick={() => addTab({ defaultDefinition: item })}
                style={{ width: '100%', color: '#d9d9d9', textAlign: 'left' }}
              >
                {item}
              </Button>
            </List.Item>
          )}
        />
      </Space>
    </>
  )
}

export default SchemaSearch
