import { v1 } from '@authzed/authzed-node'
import logger from '@/utils/logger'
import { readFileSync } from 'fs'

type SpiceClientConfig = {
  token: string
  endpoint: string
  insecure?: boolean
} & ({ insecure?: true } | {
  insecure: false
  caStringBase64: string
} | {
  insecure: false
  caFile: Buffer
})


class SpiceClient {
  private config: SpiceClientConfig
  client: v1.ZedClientInterface

  constructor(config: SpiceClientConfig) {
    this.config = config
    this.client = this.createClient()
  }

  close() {
    this.client.close()
  }

  get runner() {
    return this.client.promises
  }

  async getSchema(): Promise<string> {
    const result = await this.runner.readSchema({})
    return result.schemaText
  }

  private createClient(): v1.ZedClientInterface {
    const certificate = this.getCertificate()
    return certificate
      ? v1.NewClientWithCustomCert(this.config.token, this.config.endpoint, certificate)
      : v1.NewClient(
          this.config.token,
          this.config.endpoint,
          v1.ClientSecurity.INSECURE_PLAINTEXT_CREDENTIALS,
        )
  }
  
  private getCertificate(): Buffer | undefined {
    if (!this.config.insecure) {
      if ('caStringBase64' in this.config) {
        logger.info('Initializing with certificate from environment string')
        return Buffer.from(this.config.caStringBase64, 'base64')
      }

      if ('caFile' in this.config) {
        logger.info('Initializing with certificate from file')
        return readFileSync(this.config.caFile)
      }
    }
    
    logger.info('Initializing without certificate')
    return undefined
  }
}

export default SpiceClient