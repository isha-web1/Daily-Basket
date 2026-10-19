import express from 'express'
import { createApp } from './src/createApp.js'

const app = createApp()

export default app as express.Express
