import envConfig from "@/shared/config";
import { Injectable } from "@nestjs/common";
import OTPAuth, { TOTP } from "otpauth";

@Injectable()
export class TwoFactorAuthenticationService {
  constructor() { }

  private createTOTP(email: string, secret?: string): TOTP {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    });
  }

  generateSecret(email: string): { secret: string, uri: string } {
    const totp = this.createTOTP(email);
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    };
  }

  verifyTOTP(data: { email: string, token: string, secret?: string }): boolean {
    const totp = this.createTOTP(data.email, data?.secret);
    // window: 1 là số lượng khoảng thời gian (time step) mà token có thể hợp lệ
    // Giả sử period là 30s thì window: 1 là 30s, trong khoảng thời gian sau khi token mới được tạo ra thì token cũ vẫn còn hợp lệ
    const delta = totp.validate({ token: data.token, window: 1 });
    return delta !== null; // nếu token không hợp lệ thì delta sẽ là null và ngược lại thì delta sẽ là number
  }

  // testVerifyTOTP() {
  //   return this.verifyTOTP({
  //     email: 'hihi@gmail.com',
  //     token: '123123', // token lấy từ client browser
  //     secret: "123123" // secret key lấy từ database
  //   });
  // }
}

// const testVerifyTOTP = () => {
//   const twoFactorAuthenticationService = new TwoFactorAuthenticationService();
//   const isVerified = twoFactorAuthenticationService.testVerifyTOTP();
//   console.log("isVerified:", isVerified);
// }
// testVerifyTOTP();
