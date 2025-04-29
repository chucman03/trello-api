/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'


const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newCard = {
      ...reqBody
    }

    const createdCard = await cardModel.createNew(newCard)

    // lấy bản ghi card sau khi gọi
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    //
    if (getNewCard) {
        await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,

}