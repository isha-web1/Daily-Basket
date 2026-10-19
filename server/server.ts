import 'dotenv/config'
import { createApp } from './src/createApp.js'
import { env } from './src/config/env.js'
import { prisma } from './src/db.js'

const app = createApp()

const server = app.listen(env.PORT, () => {
  console.log(`Daily Basket API running at http://localhost:${env.PORT}`)
})

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  void shutdown('uncaughtException')
})
