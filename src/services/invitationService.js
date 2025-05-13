/* eslint-disable no-useless-catch */
import { pickUser } from '~/utils/formatters'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import { invitationModel } from '~/models/invitationModel'
import {BOARD_INVITATION_STATUS, INVITATION_TYPES} from '~/utils/constants'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    const inviter = await userModel.findOneById(inviterId)
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    const board = await boardModel.findOneById(reqBody.boardId)

    if (!inviter || !invitee || !board) {
     throw new ApiError(StatusCodes.NOT_FOUND, 'inviter or board not found')
    }

    const newInvitationData = {
        inviterId,
        inviteeId: invitee._id.toString(),
        type: INVITATION_TYPES.BOARD_INVITATION,
        boardInvitation: {
            boardId: board._id.toString(),
            status: BOARD_INVITATION_STATUS.PENDING
        }
    }
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())
    const resInvitaion = {
        ...getInvitation,
        board,
        inviter: pickUser(inviter),
        invitee: pickUser(invitee)
    }
    return resInvitaion
  } catch (error) {
    throw error
  }
}


export const invitationService = {
  createNewBoardInvitation
}