import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JWTProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

//  Middleware dam nhan viec xac thuc jwt accesstoken nhan duoc tu phia frontend co hop le hay khong
const isAuthorized = async (req, res, next) => {
    //  lay access token nam trong request cookies phia client
    const clientAccessToken = req.cookies?.accessToken
    // neu clientAccessToken ko ton tai thi tra ve loi
    if (!clientAccessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
        return
    }
    try {
        // giai ma token xem hop le khong
        const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
        // neu hop le can luu vao req.Jwtdecoded, de su dung cho cac tang xu ly sau
        req.jwtDecoded = accessTokenDecoded
        // cho phep request di tiep
        next()
    } catch (error) {
        // neu accesstoken het han thi tra ve loi cho frontend de goi api refresh
        if (error?.message?.includes('jwt expired')) {
            next(new ApiError(StatusCodes.GONE, 'need to refresh token'))
            return
        }
        // neu accesstoken ko hop le thi ta tra ve ma 401 de frontend goi api logout
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
    }
}

export const authMiddleware = { isAuthorized }