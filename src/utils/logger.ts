import { Logger } from 'tslog'

enum LogLevel {
  SILLY = 0,
  TRACE = 1,
  DEBUG = 2,
  INFO = 3,
  WARN = 4,
  ERROR = 5,
  FATAL = 6
}

export default new Logger({ name: 'spice-glass', minLevel: LogLevel.DEBUG })
