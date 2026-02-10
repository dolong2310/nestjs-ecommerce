import envConfig from '@/shared/config';
import { EMAIL_TEMPLATES_DIR } from '@/shared/constants/common.constant';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { CreateEmailResponse, Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private otpTemplate: string;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);

    // https://app.postdrop.io/ use this website for create otp template html
    const templatePath = path.resolve(EMAIL_TEMPLATES_DIR, 'otp.html');
    this.otpTemplate = fs.readFileSync(templatePath, 'utf8');
  }

  sendOtp(body: { code: string; to: string | string[]; subject?: string }): Promise<CreateEmailResponse> {
    const subject = body.subject ?? 'OTP Code';
    const sender = 'NestJS Ecommerce';
    const otpCode = body.code;

    return this.resend.emails.send({
      from: `${sender} <no-reply@doduclong.io.vn>`,
      to: body.to,
      subject: subject,
      html: this.otpTemplate
        .replaceAll('{{sender}}', sender)
        .replaceAll('{{subject}}', subject)
        .replaceAll('{{code}}', otpCode),
    });
  }
}
