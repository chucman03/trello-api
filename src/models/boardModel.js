import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'

// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // 1 board có thể có nhiều admin
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // 1 board có thể có nhiều thành viên
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false})
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    return (createdBoard)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (userId, boardId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
    //   _id: new ObjectId(id)
    // })

    const queryConditions = [
      // điều kiện board chưa bị xóa
      {_id: new ObjectId(boardId)},
      { _destroy: false },
      // điều kiện userId đang thực hiện request này phải thuộc 1 trong 2 mảng ownerIds hoặc memberIds bằng $all
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}


const pushColumnOrderIds = async (column) => {

  // push 1 giá trị column id vào mảng order
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after'}
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const pullColumnOrderIds = async (column) => {

  // push 1 giá trị column id vào mảng order
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {

  // push 1 giá trị column id vào mảng order
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    if (updateData.ColumnOrderIds) {
      updateData.ColumnOrderIds = updateData.ColumnOrderIds.map( _id => { return (new ObjectId( _id)) } )
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { returnDocument: 'after'}
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  // push 1 giá trị column id vào mảng order
  try {
    const queryConditions = [
      // điều kiện board chưa bị xóa
      { _destroy: false },
      // điều kiện userId đang thực hiện request này phải thuộc 1 trong 2 mảng ownerIds hoặc memberIds bằng $all
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } },
      ] }
    ]

    // xử lý query filter cho từng trường hợp: ví dụ search theo title
    if (queryFilters) {
      Object.keys(queryFilters).forEach(key => {
        // có phân biệt hoa thường
        // queryConditions.push({
        //   [key]: { $regex: queryFilters[key] }
        // })
        // không phân biệt hoa thường
        queryConditions.push({
          [key]: { $regex: new RegExp(queryFilters[key], 'i') }
        })
      })
    }

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title của board theo A-Z( mặc định chữ hoa đứng trước chữ thường)
        { $sort: { title: 1 } },
        // facet xử lý nhiều luồng trong 1 query
        { $facet: {
          // luồng 1: query board
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage) }, // bỏ qua số bản ghi ở page trước đó
            { $limit: itemsPerPage } //giới hạn tối đa số lượng bản ghi trên 1 page
          ],
          // luồng 2: query đếm tổng số bản ghi board trong db
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]
        } }
      ],
      // khai báo thêm thuộc tính collation 'en' để fix chữ hoa đứng trước chữ thường
      { collation: { locale: 'en' } }
    ).toArray()
    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const pushMemberIds = async (boardId, userId) => {

  // push 1 giá trị column id vào mảng order
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { memberIds: new ObjectId(userId) } },
      { returnDocument: 'after'}
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
  pushMemberIds
}