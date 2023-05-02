import { create } from 'zustand'

import { Definition } from '@/schema'

import { createSelectors } from './selectors'

interface ModalState<T> {
  open: boolean
  onSuccess?: () => void
  onCancel?: () => void
  config?: T
}

type AddRelationModalStateConfig = {
  resource?: Definition
  resourceId?: string
  subjectId?: string
  subjectType?: Definition
  relation?: string
}

type ModalStateStoreConfig = {
  addRelation: ModalState<AddRelationModalStateConfig>
}

type ModalSetter<T extends keyof ModalStateStoreConfig> = (
  value: Omit<ModalStateStoreConfig[T], 'open'>,
) => void

const initialModalState = { open: false }

function createTriggerState<T extends keyof ModalStateStoreConfig>(
  config: Omit<ModalStateStoreConfig[T], 'open'>,
): ModalStateStoreConfig[T] {
  return {
    open: true,
    ...config,
  }
}

function triggerComplete<T extends keyof ModalStateStoreConfig>(
  key: T,
  state: ModalStateStore,
  cancelled: boolean,
): ModalStateStoreConfig[T] {
  const current = state[key]
  if (cancelled) {
    current.onCancel?.()
  } else {
    current.onSuccess?.()
  }

  return { ...initialModalState }
}

export type ModalStateStore = ModalStateStoreConfig & {
  triggerAddRelation: ModalSetter<'addRelation'>
  triggerAddRelationComplete: (cancelled: boolean) => void
}

export const useModalStateStoreBase = create<ModalStateStore>()((set) => ({
  addRelation: { ...initialModalState },
  triggerAddRelation: (value) => {
    set(() => ({
      addRelation: createTriggerState<'addRelation'>(value),
    }))
  },
  triggerAddRelationComplete: (cancelled) => {
    set((state) => ({
      addRelation: triggerComplete('addRelation', state, cancelled),
    }))
  },
}))

export const useModalStateStore = createSelectors(useModalStateStoreBase)
