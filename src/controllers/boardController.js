import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
  // // set abortEarly false để show hết lỗi, true thì trả về lỗi đầu tiên
  // await correctCondition.validateAsync(req.body, { abortEarly: false })
  // next()
    const createdBoard = await boardService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdBoard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY,  'test errow')
  } catch (error) {
    next(error)
  }
}
const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const board = await boardService.getDetails(boardId)

    res.status(StatusCodes.OK).json(board)
    // throw new ApiError(StatusCodes.BAD_GATEWAY,  'test errow')
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails
}