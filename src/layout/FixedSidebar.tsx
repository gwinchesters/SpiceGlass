import {
  ApartmentOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Button, Layout, Space, Tooltip } from 'antd'
import { CSSProperties } from 'react'

const { Sider } = Layout

const fixedSiderStyle: CSSProperties = {
  overflow: 'auto',
  height: '100%',
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  textAlign: 'center',
  backgroundColor: '#002329',
}

function FixedSidebar() {
  return (
    <Sider width={50} style={fixedSiderStyle}>
      <Space
        direction="vertical"
        size="middle"
        style={{ display: 'flex', marginTop: '10px' }}
      >
        <Tooltip placement="right" title="Connections">
          <Button
            type="text"
            ghost={true}
            icon={<DatabaseOutlined style={{ color: 'white' }} />}
            size="large"
          />
        </Tooltip>
        <Tooltip placement="right" title="Schema Explorer">
          <Button
            type="text"
            ghost={true}
            icon={<ApartmentOutlined style={{ color: 'white' }} />}
            size="large"
          />
        </Tooltip>
        <Tooltip placement="right" title="Schema Visualizer">
          <Button
            type="text"
            ghost={true}
            icon={<NodeIndexOutlined style={{ color: 'white' }} />}
            size="large"
          />
        </Tooltip>
        <Tooltip placement="right" title="Settings">
          <Button
            type="text"
            ghost={true}
            icon={<SettingOutlined style={{ color: 'white' }} />}
            size="large"
          />
        </Tooltip>
      </Space>
    </Sider>
  )
}

export default FixedSidebar
