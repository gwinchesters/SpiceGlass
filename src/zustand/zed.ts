import { create } from 'zustand'

import { Schema } from '@/schema'
import SpiceClient from '@/services/spice'

import { createSelectors } from './selectors'

export interface SpiceConfig {
  token: string
  endpoint: string
}

export interface ZedState {
  spiceConfig: SpiceConfig
  spiceClient: SpiceClient | undefined
  schema: Schema | undefined
  schemaError: string | undefined
  lastUpdate: number
  setSchema: (schema: Schema) => void
  setSchemaError: (err: string | undefined) => void
  setSpiceClient: (spiceClient: SpiceClient) => void
  triggerRefresh: () => void
}

export const useZedStoreBase = create<ZedState>()((set) => ({
  spiceConfig: {
    token: import.meta.env.VITE_ZED_TOKEN,
    endpoint: import.meta.env.VITE_ZED_ENDPOINT,
  },
  spiceClient: undefined,
  schema: undefined,
  schemaError: undefined,
  lastUpdate: Date.now(),
  setSchema: (schema) => set(() => ({ schema })),
  setSchemaError: (schemaError) => set(() => ({ schemaError })),
  setSpiceClient: (spiceClient) => set(() => ({ spiceClient })),
  triggerRefresh: () => set(() => ({ lastUpdate: Date.now() })),
}))

export const useZedStore = createSelectors(useZedStoreBase)
