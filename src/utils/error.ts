export const throwError = (error: string | Error): never => {
  if (error instanceof Error) {
    throw error
  }

  throw Error(error)
}
