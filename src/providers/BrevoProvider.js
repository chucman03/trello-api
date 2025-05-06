const SibApiV3Sdk = require('@getbrevo/brevo');
import { env } from '~/config/environment';
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
//khởi tạo biến lưu thông tin cần thiết
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
// tài khoản gửi mail
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }
//array lưu những user muốn gửi
  sendSmtpEmail.to = [{ email: recipientEmail }]
  // tiêu đề
  sendSmtpEmail.subject = customSubject
//  nội dung
  // tiêu đề
  sendSmtpEmail.htmlContent = htmlContent
//   gọi hành động gửi mail(trả về 1 promise)
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}


export const BrevoProvider = {
  sendEmail
}