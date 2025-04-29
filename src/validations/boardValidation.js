import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'String.min': 'Title min 3 chars',
      'String.max': 'Title max 50 chars',
      'String.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

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

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),

  })

  try {
    // set abortEarly false để show hết lỗi, true thì trả về lỗi đầu tiên, cho phép unknown để không đẩy 1 số field l
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
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

const moveCardToDifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    // set abortEarly false để show hết lỗi, true thì trả về lỗi đầu tiên, cho phép unknown để không đẩy 1 số field l
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

export const boardValidation = {
  createNew, update, moveCardToDifferentColumn
}