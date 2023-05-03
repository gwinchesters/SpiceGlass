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
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id !== id),
    })),
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
