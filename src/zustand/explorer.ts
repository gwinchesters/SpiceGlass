import { create } from 'zustand'

import { Definition } from '@/schema'

export interface ExplorerState {
  definition: Definition | undefined
  setDefinition: (definition: Definition | undefined) => void
}

export const useExplorerStore = create<ExplorerState>()((set) => ({
  definition: undefined,
  setDefinition: (definition) => set(() => ({ definition })),
}))
