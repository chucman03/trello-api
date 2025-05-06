/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * 'A bit of fragrance clings to the hand that gives flowers!'
 */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from './config/cors'
import cookieParser from 'cookie-parser'

const START_SERVER = () => {
  const app = express()
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // cau hinh cookieparse
  app.use(cookieParser())

  app.use(cors(corsOptions))
  app.use(express.json())

  app.use('/v1', APIs_V1)
  //middleware xu ly loi tap trung
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    // môi trường production
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
        console.log(`production Hello ${env.AUTHOR}, I am running at port ${process.env.PORT}`)
      })
  } else{
    // môi trường dev
    app.listen(process.env.LOCAL_DEV_APP_PORT, process.env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
        console.log(`Hello ${env.AUTHOR}, I am running at http://${process.env.LOCAL_DEV_APP_HOST}:${process.env.LOCAL_DEV_APP_PORT}/`)
      })
  }

 

  exitHook(() => {
    CLOSE_DB()
  })
}

(async () => {
  try {
    console.log('Connecting to cloud atlas')
    await CONNECT_DB()
    console.log('Connected to db success')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)}
})()

// CONNECT_DB()
//   .then(() => console.log('Connected to db success'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })


