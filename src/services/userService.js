import { pickUser, slugify } from '~/utils/formatters'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { WEBSTE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JWTProvider'
import { env } from '~/config/environment'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // kiểm tra xem có tồn tại trong hệ thống chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    // tạo bản ghi lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), //8 là độ phức tạp
      userName: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // gửi email xác thực
    const verficationLink = `${WEBSTE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello app: please verify your email'
    const htmlContent = `
      <h3>Here is your verification link:<h3/>
      <h3>${verficationLink}<h3/>
      <h3>Sincerely, Man Duc Chuc<h3/>
    `
    // gọi tới provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
    // return data cho người dùng
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is already active')
    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token invalid')
    const updateData = {
    isActive: true,
    verifyToken: null
    }
    const updatedUser = await userModel.update(existUser._id, updateData)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not active')
    if (bcryptjs.compareSync(reqBody.password, existUser.password)) {
      // reqBody.password: 12345a
      // existUser.password: dang da hash
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorect!')
    }

    // ok thi bat dau tao token dang nhap tra ve cho frontend
    // tao thong tin dinh kem token bao gom _id, email cua user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }
    // tao 2 loai token 
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )
    // tra ve thong tin token
    return {accessToken, refreshToken, ...pickUser(existUser)}
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )
    return { accessToken }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew, verifyAccount, login, refreshToken

}