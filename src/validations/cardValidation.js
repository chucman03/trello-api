import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()

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
    description: Joi.string().optional()

  })

  try {
    // set abortEarly false để show hết lỗi, true thì trả về lỗi đầu tiên
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

export const cardValidation = {
  createNew, update
}