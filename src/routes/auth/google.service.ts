import { AuthRepository } from '@/routes/auth/auth.repo';
import { AuthService } from '@/routes/auth/auth.service';
import { GoogleAuthCallbackQueryType, GoogleAuthCallbackResponseType, GoogleAuthResponseType, GoogleAuthStateType } from '@/routes/auth/auth.type';
import { RolesService } from '@/routes/auth/roles.service';
import envConfig from "@/shared/config";
import { HashingService } from '@/shared/services/hashing.service';
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Credentials, OAuth2Client } from "google-auth-library";
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
    private readonly hashingService: HashingService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    );
  }

  getAuthorizationUrl({ ip, userAgent }: GoogleAuthStateType): GoogleAuthResponseType {
    // Scope là các quyền mà chúng ta cần để lấy thông tin từ Google
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    // State là dữ liệu mà chúng ta muốn gửi đi khi redirect về browser client
    // Tại sao ngoài JSON.stringify lại còn thêm Buffer.from()?
    // Vì JSON.stringify() sẽ trả về một chuỗi JSON, nhưng chuỗi JSON này có thể chứa các ký tự đặc biệt
    // Ví dụ: { ip: '127.0.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    // Khi đó, chuỗi JSON này sẽ không thể được sử dụng trong URL
    // Vì vậy, chúng ta cần phải chuyển đổi chuỗi JSON thành base64
    // Base64 là một chuỗi chỉ chứa các ký tự a-z, A-Z, 0-9, +, / và =
    // Và chuỗi base64 này sẽ không chứa các ký tự đặc biệt
    const state = Buffer.from(JSON.stringify({ ip, userAgent })).toString('base64');

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // offline access -> chúng ta cần lấy refresh token
      include_granted_scopes: true, // include granted scopes -> chúng ta cần lấy quyền mà người dùng đã cho phép
      scope,
      state, // state là dữ liệu mà chúng ta muốn gửi đi khi redirect về browser client
    });

    return { url };
  }

  async authCallback(query: GoogleAuthCallbackQueryType): Promise<GoogleAuthCallbackResponseType> {
    const { state, code } = query;

    // 1. Get ip and userAgent from state
    let ip = "Unknown";
    let userAgent = "Unknown";

    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      ip = stateData.ip;
      userAgent = stateData.userAgent;
    } catch (error) {
      console.log("error parsing state: ", error);
    }

    try {
      // 2. Get token info from code
      const { tokens } = await this.oauth2Client.getToken(code);
      // 2.1 set credentials
      this.oauth2Client.setCredentials(tokens as Credentials); // set credentials to oauth2Client (tokens bao gồm các access token, refresh token, ... để xác thực với google)

      // 3. Get user info from google
      const oauth2 = google.oauth2({ auth: this.oauth2Client, version: 'v2' });
      const { data } = await oauth2.userinfo.get();

      // 3.1 Check if email is verified
      if (!data.verified_email || !data.email) {
        throw new UnauthorizedException([{
          field: 'email',
          message: 'Email not verified',
        }]);
      }

      // 4. Find user by email
      let user = await this.authRepository.findUserUniqueIncludeRole({ email: data.email });

      // 5. If user not found, register new user
      if (!user) {
        // 5.1 Get user role id
        const userRoleIdPromise = this.rolesService.getUserRoleId();
        // 5.2 Generate random password
        const randomPassword = uuidv4();
        // 5.3 Hash password
        const hashedPasswordPromise = this.hashingService.hash(randomPassword);
        // 5.4 Execute promises
        const [userRoleId, hashedPassword] = await Promise.all([userRoleIdPromise, hashedPasswordPromise]);
        // 5.5 Create user
        user = await this.authRepository.createUserIncludeRole({
          name: data.name ?? "",
          email: data.email,
          password: hashedPassword,
          phoneNumber: "",
          avatar: data.picture ?? null,
          roleId: userRoleId,
        });
      }

      // 6. Create device
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      });

      if (!device) {
        throw new BadRequestException([{
          field: 'device',
          message: 'Failed to create device',
        }]);
      }

      // 7. Generate tokens
      const jwtTokens = await this.authService.createAuthTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      });

      // 8. Return tokens
      return jwtTokens;
    } catch (error) {
      throw error;
    }
  }
}