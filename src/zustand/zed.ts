import { create } from 'zustand'

import { Schema } from '@/schema'

export interface SpiceConfig {
  token: string
  endpoint: string
}

export interface ZedState {
  spiceConfig: SpiceConfig
  schema: Schema | undefined
  schemaError: string | undefined
  setSchema: (schema: Schema) => void
  setSchemaError: (err: string | undefined) => void
}

export const useZedStore = create<ZedState>()((set) => ({
  spiceConfig: {
    token: import.meta.env.VITE_ZED_TOKEN,
    endpoint: import.meta.env.VITE_ZED_ENDPOINT,
  },
  schema: undefined,
  schemaError: undefined,
  setSchema: (schema) => set(() => ({ schema })),
  setSchemaError: (schemaError) => set(() => ({ schemaError })),
}))
