import envConfig from "@/shared/config";
import { Injectable } from "@nestjs/common";
import { CreateEmailResponse, Resend } from "resend";
import fs from "fs";
import path from "path";

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  sendOtp(body: { code: string, to: string | string[], subject?: string }): Promise<CreateEmailResponse> {
    // https://app.postdrop.io/ use this website for create otp template html
    const templatePath = path.join(__dirname, '..', 'email-templates', 'otp.html');
    const otpTemplate = fs.readFileSync(templatePath, 'utf8');
    const subject = body.subject ?? "OTP Code";
    const sender = 'NestJS Ecommerce';
    const otpCode = body.code;

    return this.resend.emails.send({
      from: `${sender} <no-reply@doduclong.io.vn>`,
      to: body.to,
      subject: subject,
      html: otpTemplate.replaceAll('{{sender}}', sender).replaceAll('{{subject}}', subject).replaceAll('{{code}}', otpCode),
    });
  }
}