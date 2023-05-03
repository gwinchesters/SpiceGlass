import { Layout } from 'antd'
import { useEffect } from 'react'

import SchemaSearch from '@/explorer/SchemaSearch'
import DefinitionContent from '@/explorer/TabManager'
import FixedSidebar from '@/layout/FixedSidebar'
import SpiceClient from '@/services/spice'
import { useZedStore } from '@/zustand'

import Modals from './modals/Modals'

const { Sider, Content } = Layout

function App() {
  const [
    spiceConfig,
    setSchema,
    setSchemaError,
    spiceClient,
    setSpiceClient,
    schema,
  ] = useZedStore((state) => [
    state.spiceConfig,
    state.setSchema,
    state.setSchemaError,
    state.spiceClient,
    state.setSpiceClient,
    state.schema,
  ])

  useEffect(() => {
    setSpiceClient(
      new SpiceClient({
        ...spiceConfig,
      }),
    )
  }, [spiceConfig, setSpiceClient])

  useEffect(() => {
    const fetchSchema = async () => {
      if (spiceClient) {
        try {
          const result = await spiceClient.getSchema()
          setSchema(result)
          setSchemaError(undefined)
        } catch (e) {
          setSchemaError((e as { details: string }).details)
        }
      }
    }

    void fetchSchema()
  }, [spiceClient, setSchema, setSchemaError])

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
      {schema && <Modals />}
    </Layout>
  )
}

export default App
