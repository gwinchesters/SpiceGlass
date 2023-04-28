import { Layout } from 'antd'
import { useEffect } from 'react'

import SchemaSearch from '@/explorer/SchemaSearch'
import DefinitionContent from '@/explorer/TabManager'
import FixedSidebar from '@/layout/FixedSidebar'
import SpiceClient from '@/services/spice'
import { useZedStore } from '@/zustand'

const { Sider, Content } = Layout

function App() {
  const [spiceConfig, setSchema, setSchemaError, spiceClient, setSpiceClient] =
    useZedStore((state) => [
      state.spiceConfig,
      state.setSchema,
      state.setSchemaError,
      state.spiceClient,
      state.setSpiceClient,
    ])

  useEffect(() => {
    setSpiceClient(
      new SpiceClient({
        ...spiceConfig,
        caStringBase64:
          'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJkVENDQVJ5Z0F3SUJBZ0lRZk5HOHRvU3dJZzc3SjA1eWxJQnBTakFLQmdncWhrak9QUVFEQWpBYk1Sa3cKRndZRFZRUURFeEJ3WlhKdGFYTnphVzl1Y3kxallTMHlNQjRYRFRJek1ESXhOakU0TlRBMU1Wb1hEVEl6TURVeApOekU0TlRBMU1Wb3dHekVaTUJjR0ExVUVBeE1RY0dWeWJXbHpjMmx2Ym5NdFkyRXRNakJaTUJNR0J5cUdTTTQ5CkFnRUdDQ3FHU000OUF3RUhBMElBQkdTSXpCZ0Z1d3FwR3FzTGdNVitPQnZsbE5ucWZ0N2hob2FubHh5dFlYN0oKS2lNdG1zb1VWNDVrSllNMkNQUWMwNGtRdmNBNUl3dEUvaXB3T3B1OElQR2pRakJBTUE0R0ExVWREd0VCL3dRRQpBd0lDcERBUEJnTlZIUk1CQWY4RUJUQURBUUgvTUIwR0ExVWREZ1FXQkJSZG1GWkxBWHlJdkZYd0Ywc1Q4V0JECnlYZExDakFLQmdncWhrak9QUVFEQWdOSEFEQkVBaUFiTTVWRlpSV1pUaFBURHJoS2FuRTEyZklkYmlhUWRlcFIKaVR4QWJzU2h4Z0lnT21UVUdEYnRBYkN0c01hL2d1cXk4Q2NWcHZOQWtlOHgvVFNOU2U3cUNWOD0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=',
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
    </Layout>
  )
}

export default App
