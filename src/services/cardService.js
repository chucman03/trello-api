/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'


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

const update = async (cardId, reqBody, cardCoverFile, userInfor) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, {
        cover : uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfor._id,
        userEmail: userInfor.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else {
      // update chung
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew, update

}