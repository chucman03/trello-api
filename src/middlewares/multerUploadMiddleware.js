import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import ApiError from '~/utils/ApiError';
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators';

// kiểm tra loại file được chấp nhận
const customFileFilter = (req, file, callback) => {
    // sử dụng mimetype để kiểm tra kiểu file
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
        const errMessage = 'File type is invalid. Only accept jpg, jpeg and png';
        return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
      }
      // nếu kiểu file hợp lệ 
      return callback(null, true)
}
// khởi tạo function upload
const upload = multer({
    limits: { fileSize: LIMIT_COMMON_FILE_SIZE},
    fileFilter: customFileFilter
})

export const multerUploadMiddleware = {upload}