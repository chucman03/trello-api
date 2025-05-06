import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRoute } from './userRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'apis v1 is ready to use' })
})
// board api
Router.use('/boards', boardRoute)

// column api
Router.use('/columns', columnRoute)

// card api
Router.use('/cards', cardRoute)
// user api
Router.use('/users', userRoute)

export const APIs_V1 = Router