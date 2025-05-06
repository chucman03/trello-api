import JWT from 'jsonwebtoken'

// function tao token can 3 tham so dau vao: userInfo, secretSignature (chu ky bi mat dang chuoi), tokenLife(thoi gian ton tai cua token)
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // ham sign tao moi token vs thuat toan hs256
        return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
    } catch (error) {
        throw new Error(error)
  }
}

// function so sanh secretSignature
const verifyToken = async (token, secretSignature) => {
  try {
    // ham verify cua thu vien JWT
    return JWT.verify(token, secretSignature)
    } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken, verifyToken
}