import { Tabs } from 'antd'
import { KeyboardEvent, MouseEvent, useEffect } from 'react'

import { explorerStyle } from '@/utils/styles'
import { useExplorerStore } from '@/zustand'

import DetailTab from './DetailTab'

type TargetKey = MouseEvent | KeyboardEvent | string

const DefinitionContent = () => {
  const [tabs, activeTab, setActiveTab, addTab, removeTab] = useExplorerStore(
    (state) => [
      state.tabs,
      state.activeTab,
      state.setActiveTab,
      state.addTab,
      state.removeTab,
    ],
  )

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
      addTab()
    } else {
      removeTab(targetKey.toString())
    }
  }

  const onChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab)
  }

  return (
    <section
      style={{
        height: '100%',
        backgroundColor: explorerStyle.backgroundColor,
      }}
    >
      <Tabs
        type="editable-card"
        size="small"
        activeKey={activeTab}
        onChange={onChange}
        onEdit={onEdit}
        items={tabs.map((t) => ({
          label: t.label,
          key: t.id,
          children: (
            <DetailTab
              id={t.id}
              entityId={t.entityId}
              defaultDefinition={t.defaultDefinition}
            />
          ),
        }))}
      />
      <div
        style={{
          height: '100%',
          backgroundColor: explorerStyle.backgroundColor,
        }}
      ></div>
    </section>
  )
}

export default DefinitionContent
