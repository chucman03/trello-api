import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
  try {

    const createdColumn = await columnService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const updatedColumn = await columnService.update(columnId, req.body)

    res.status(StatusCodes.OK).json(updatedColumn)
    // throw new ApiError(StatusCodes.BAD_GATEWAY,  'test errow')
  } catch (error) {
    next(error)
  }
}

const deleteItem = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const result = await columnService.deleteItem(columnId)

    res.status(StatusCodes.OK).json(result)
    // throw new ApiError(StatusCodes.BAD_GATEWAY,  'test errow')
  } catch (error) {
    next(error)
  }
}

export const columnController = {
  createNew, update, deleteItem
}