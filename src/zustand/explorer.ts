import { create } from 'zustand'

import { createSelectors } from './selectors'

export interface Tab {
  id: string
  label: string | undefined
  defaultDefinition?: string
  entityId?: string
}

export interface ExplorerState {
  tabs: Tab[]
  activeTab: string | undefined
  setActiveTab: (id: string) => void
  addTab: (config?: Pick<Tab, 'defaultDefinition' | 'entityId'>) => void
  removeTab: (id: string) => void
  updateLabel: (id: string, label: string) => void
}

const genId = () => {
  return String(Date.now())
}

export const useExplorerStoreBase = create<ExplorerState>()((set) => ({
  tabs: [],
  activeTab: undefined,
  setActiveTab: (id) =>
    set(() => ({
      activeTab: id,
    })),
  addTab: ({ defaultDefinition, entityId } = {}) =>
    set((state) => {
      const id = genId()
      return {
        tabs: [
          ...state.tabs,
          { id, label: defaultDefinition, defaultDefinition, entityId },
        ],
        activeTab: id,
      }
    }),
  removeTab: (id) =>
    set((state) => {
      const index = state.tabs.findIndex((t) => t.id === id)
      const newTabs = state.tabs.filter((t) => t.id !== id)
      if (id === state.activeTab) {
        const newIndex = index > 0 ? index - 1 : 0
        const newActive =
          newTabs.length > newIndex ? newTabs[newIndex].id : undefined
        return {
          tabs: newTabs,
          activeTab: newActive,
        }
      }

      return {
        tabs: newTabs,
      }
    }),
  updateLabel: (id, label) =>
    set((state) => ({
      tabs: state.tabs.map((t) => {
        if (t.id === id) {
          t.label = label
        }
        return t
      }),
    })),
}))

export const useExplorerStore = createSelectors(useExplorerStoreBase)
