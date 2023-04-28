import { Layout } from 'antd'
import { useEffect, useState } from 'react'

import SchemaSearch from '@/explorer/SchemaSearch'
import DefinitionContent from '@/explorer/TabManager'
import FixedSidebar from '@/layout/FixedSidebar'
import SpiceClient from '@/services/spice'
import { useZedStore } from '@/zustand'

const { Sider, Content } = Layout

function App() {
  const [spiceConfig, setSchema, setSchemaError] = useZedStore((state) => [
    state.spiceConfig,
    state.setSchema,
    state.setSchemaError,
  ])
  const [client, setClient] = useState<SpiceClient>()

  useEffect(() => {
    setClient(new SpiceClient(spiceConfig))
  }, [spiceConfig, setClient])

  useEffect(() => {
    const fetchSchema = async () => {
      if (client) {
        try {
          const result = await client.getSchema()
          setSchema(result)
          setSchemaError(undefined)
        } catch (e) {
          setSchemaError((e as { details: string }).details)
        }
      }
    }

    void fetchSchema()
  }, [client, setSchema, setSchemaError])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <FixedSidebar />
      <Layout style={{ marginLeft: 50 }}>
        <Sider style={{ backgroundColor: '#00474f' }}>
          <SchemaSearch />
        </Sider>
        <Content>
          <DefinitionContent />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
