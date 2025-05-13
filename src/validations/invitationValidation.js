import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNewBoardInvitation = async (req, res, next) => {
  const correctCondition = Joi.object({
    inviteeEmail: Joi.string().required(),
    boardId: Joi.string().required()
  })

  try {
    // set abortEarly false để show hết lỗi, true thì trả về lỗi đầu tiên
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // cho request đi tiếp sang controller nếu validate hợp lệ
    next()
    // res.status(StatusCodes.CREATED).json({ message: 'create new board' })
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //   errors: new Error(error).message
    // })
  }
}


export const invitationValidation = {
  createNewBoardInvitation
}