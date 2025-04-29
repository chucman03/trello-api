/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newColumn = {
      ...reqBody
    }

    const createdColumn = await columnModel.createNew(newColumn)

    // lấy bản ghi column sau khi gọi
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    //
    if (getNewColumn) {
        // xử lí cấu trúc data trc khi trả cho frontend
        getNewColumn.cards =[]
        // cập nhật mảng columnOrderIds trong collection board
        await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}
const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now
    }
    const updatedColumn = await columnModel.update(columnId, updateData)
    return updatedColumn
  } catch (error) {
    throw error
  }
}
const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
   await columnModel.deleteOneById(columnId)
   await cardModel.deleteManyByColumnId(columnId)
   await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and card deleted successfully'}
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew, update, deleteItem
}