import { Tabs } from 'antd'
import { KeyboardEvent, MouseEvent, useCallback, useState } from 'react'

import DetailTab from './DetailTab'
type TargetKey = MouseEvent | KeyboardEvent | string

type Tab = {
  label: string
  key: string
  children: JSX.Element
}

const DefinitionContent = () => {
  const [activeTab, setActiveTab] = useState<string>()
  const [tabs, setTabs] = useState<Tab[]>([])
  const [tabCounter, setTabCounter] = useState(1)

  const setTabLabel = useCallback(
    (id: string, label: string) => {
      tabs.forEach((t) => {
        if (t.key === id) {
          t.label = label
        }
      })

      setTabs(tabs)
    },
    [tabs, setTabs],
  )

  const buildTab = (id: string) => {
    return <DetailTab id={id} setLabel={setTabLabel} />
  }

  const addTab = () => {
    const newTabs = [...tabs]
    const id = String(Date.now())
    newTabs.push({
      label: `Tab ${tabCounter}`,
      key: id,
      children: buildTab(id),
    })
    setTabCounter(tabCounter + 1)
    setTabs(newTabs)
    setActiveTab(id)
  }

  const removeTab = (targetTab: TargetKey) => {
    let newActiveTab = activeTab
    let lastIndex = -1

    tabs.forEach((t, i) => {
      if (t.key === targetTab) {
        lastIndex = i - 1
      }
    })

    const newTabs = tabs.filter((t) => t.key !== targetTab)

    if (newTabs.length && newActiveTab === targetTab) {
      if (lastIndex >= 0) {
        newActiveTab = newTabs[lastIndex].key
      } else {
        newActiveTab = tabs[0].key
      }
    }

    setTabs(newTabs)
    setActiveTab(newActiveTab)
  }

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
      addTab()
    } else {
      removeTab(targetKey)
    }
  }

  const onChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab)
  }

  return (
    <Tabs
      type="editable-card"
      size="small"
      activeKey={activeTab}
      onChange={onChange}
      onEdit={onEdit}
      items={tabs}
    />
  )
}

export default DefinitionContent
