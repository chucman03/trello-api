import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'


const Router = express.Router()

Router.route('/') 
  // .get(authMiddleware.isAuthorized, (req, res) => {
  //   res.status(StatusCodes.OK).json({ message: 'get list board' })
  // })
  // viết lại route đúng cấu trúc route, controller, service, models
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)
Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

// api hỗ trợ di chuyển card giữa các column
Router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)

export const boardRoute = Router