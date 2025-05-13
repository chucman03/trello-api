import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
  // // set abortEarly false để show hết lỗi, true thì trả về lỗi đầu tiên
  // await correctCondition.validateAsync(req.body, { abortEarly: false })
  // next()
    const userId = req.jwtDecoded._id
    const createdBoard = await boardService.createNew(userId, req.body)

    res.status(StatusCodes.CREATED).json(createdBoard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY,  'test errow')
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY,  'test errow')
  } catch (error) {
    next(error)
  }
}
const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)

    res.status(StatusCodes.OK).json(board)
    // throw new ApiError(StatusCodes.BAD_GATEWAY,  'test errow')
  } catch (error) {
    next(error)
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)

    res.status(StatusCodes.OK).json(result)
    // throw new ApiError(StatusCodes.BAD_GATEWAY,  'test errow')
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { page, itemsPerPage } = req.query
    const result = await boardService.getBoards(userId, page, itemsPerPage)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}