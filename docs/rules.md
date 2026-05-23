# NestJS Backend Development Rules

## 🎯 General Principles

- Always follow SOLID principles and Clean Architecture
- Code must be clear, maintainable and testable
- Use TypeScript strict mode
- Prioritize composition over inheritance
- DRY (Don't Repeat Yourself) but avoid over-abstraction

## 📁 Project Structure

```
src/
├── common/              # Shared utilities, decorators, guards, interceptors
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── filters/
│   └── constants/
├── config/              # Configuration files
├── modules/             # Feature modules
│   └── [feature]/
│       ├── dto/
│       ├── entities/
│       ├── [feature].controller.ts
│       ├── [feature].service.ts
│       ├── [feature].module.ts
│       └── [feature].repository.ts
├── database/            # Database configurations, migrations, seeds
├── main.ts
└── app.module.ts
```

## 🏗️ Module Structure

### Controller Rules
- **DO NOT** put business logic in controllers
- Only handle HTTP requests/responses
- Validate input using DTOs and ValidationPipe
- Use proper HTTP status codes
- Apply guards, interceptors at controller level if needed

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}
```

### Service Rules
- Contains ALL business logic
- A service should have single responsibility
- Inject dependencies via constructor
- Return domain objects, DO NOT return HTTP responses
- Handle errors and throw appropriate exceptions

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    await this.emailService.sendWelcomeEmail(savedUser.email);
    return savedUser;
  }
}
```

### Repository Pattern
- Use Repository pattern for database operations
- Separate database logic from business logic
- Custom repositories for complex queries

```typescript
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmailWithProfile(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['profile'],
    });
  }
}
```

## 📝 DTOs & Validation

- Use `class-validator` and `class-transformer`
- Create separate DTOs for create, update, response
- DO NOT expose entities directly
- Use `@ApiProperty()` for Swagger documentation

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserResponseDto {
  @Exclude()
  password: string;

  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;
}
```

## 🗃️ Database & Entities

### TypeORM Entities
- Use decorators properly
- Always have timestamps (createdAt, updatedAt)
- Set indexes for frequently queried fields
- Use soft delete instead of hard delete

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

### Migrations
- ALWAYS create migrations for schema changes
- DO NOT modify existing migrations
- Test migrations both up and down
- Naming: `TIMESTAMP-descriptive-name.ts`

```bash
npm run migration:generate -- src/database/migrations/AddUserEmailIndex
npm run migration:run
```

## 🔒 Authentication & Authorization

### JWT Strategy
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### Guards
- Use guards for authentication
- Role-based access control with custom decorators

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Custom decorator
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// Usage
@Get('admin')
@Roles(Role.ADMIN)
async getAdminData() {
  return this.service.getAdminData();
}
```

## 🔧 Configuration

- Use `@nestjs/config`
- Validate environment variables
- DO NOT hardcode sensitive data

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});

// config/validation.schema.ts
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  JWT_SECRET: Joi.string().required(),
});
```

## 🚨 Error Handling

### Custom Exceptions
```typescript
export class UserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(`User with ID ${userId} not found`);
  }
}

export class EmailAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
```

### Exception Filters
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

## 📊 Logging

- Use NestJS Logger or Winston
- Log levels: error, warn, info, debug
- DO NOT log sensitive data (passwords, tokens)

```typescript
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    try {
      const user = await this.userRepository.save(createUserDto);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## 🧪 Testing

### Unit Tests
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const createUserDto = { email: 'test@test.com', password: 'Test1234' };
    repository.save.mockResolvedValue({ id: 1, ...createUserDto });

    const result = await service.create(createUserDto);

    expect(result).toHaveProperty('id');
    expect(repository.save).toHaveBeenCalledWith(createUserDto);
  });
});
```

### E2E Tests
```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@test.com', password: 'Test1234' })
      .expect(201);
  });
});
```

## 🚀 Performance

### Caching
```typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOne(id: number): Promise<User> {
    const cacheKey = `user_${id}`;
    const cached = await this.cacheManager.get<User>(cacheKey);
    
    if (cached) return cached;
    
    const user = await this.userRepository.findOne({ where: { id } });
    await this.cacheManager.set(cacheKey, user, 3600);
    
    return user;
  }
}
```

### Pagination
```typescript
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

async findAll(paginationDto: PaginationDto) {
  const { page, limit } = paginationDto;
  const [data, total] = await this.userRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}
```

## 📚 Documentation

- Use Swagger/OpenAPI
- Document ALL endpoints
- Provide examples in @ApiProperty

```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

## 🔐 Security Best Practices

1. **DO NOT** expose stack traces in production
2. Use Helmet middleware
3. Enable CORS properly
4. Rate limiting for APIs
5. Input sanitization
6. Hash passwords with bcrypt (salt rounds >= 10)
7. Validate ALL user inputs
8. Use parameterized queries (TypeORM handles this)

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  await app.listen(3000);
}
```

## 📋 Code Style

- Use ESLint and Prettier
- Follow NestJS naming conventions
- Files: kebab-case (user.service.ts)
- Classes: PascalCase (UserService)
- Methods/variables: camelCase (findUser)
- Constants: UPPER_SNAKE_CASE (MAX_RETRIES)

## 🎯 Checklist Before Commit

- [ ] Code passes linting (npm run lint)
- [ ] All tests pass (npm run test)
- [ ] No console.logs (use Logger)
- [ ] DTOs have validation
- [ ] Swagger documentation updated
- [ ] Sensitive data NOT hardcoded
- [ ] Error handling implemented
- [ ] TypeScript strict mode compliant

## 🔄 Git Workflow

- Feature branches: `feature/user-authentication`
- Bugfix branches: `bugfix/fix-login-error`
- Commit messages: `feat: add user authentication` (Conventional Commits)
- DO NOT commit directly to main/master
- Pull request required with code review
