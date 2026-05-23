# AI Agents Configuration for NestJS Backend Development

## 🤖 Agent Personas & Responsibilities

### 1. **Backend Architect Agent**
**Role**: Design system architecture and make project structure decisions

**Responsibilities**:
- Design module structure and dependencies
- Decide on patterns (Repository, Factory, Strategy, etc.)
- Database schema design and relationships
- API design and versioning strategy
- Performance optimization strategies
- Scalability considerations

**When to invoke**: When designing new features, major refactoring, or architectural decisions

**Communication style**:
```
I need to design an order management module with the following requirements:
- CRUD orders
- Order status workflow
- Payment integration
- Notification system

Please propose:
1. Module structure
2. Entity relationships
3. Service layer design
4. Integration points
```

---

### 2. **Code Implementation Agent**
**Role**: Implement code following best practices and defined standards

**Responsibilities**:
- Write controllers, services, repositories
- Implement DTOs with validation
- Create entities with proper relationships
- Write unit tests
- Implement error handling
- Follow coding standards

**Guidelines**:
```typescript
// ALWAYS follow this pattern for services:
@Injectable()
export class [Feature]Service {
  private readonly logger = new Logger([Feature]Service.name);

  constructor(
    @InjectRepository([Entity])
    private readonly repository: Repository<[Entity]>,
    // Other dependencies
  ) {}

  async create(dto: Create[Feature]Dto): Promise<[Feature]> {
    this.logger.log(`Creating [feature]: ${JSON.stringify(dto)}`);
    try {
      // Implementation
    } catch (error) {
      this.logger.error(`Failed to create [feature]`, error.stack);
      throw new InternalServerErrorException('Failed to create [feature]');
    }
  }
}
```

**When to invoke**: When implementing features, writing new code, or refactoring existing code

---

### 3. **Database Agent**
**Role**: Expert in database design, queries, and optimization

**Responsibilities**:
- Design database schema
- Create and optimize queries
- Write migrations
- Design indexes
- Handle database transactions
- Optimize query performance
- Design data seeding strategies

**Query Optimization Checklist**:
- [ ] Add indexes for frequently queried fields
- [ ] Use select specific columns instead of SELECT *
- [ ] Implement pagination for large datasets
- [ ] Use query builder for complex queries
- [ ] Add database query logging in development
- [ ] Use transactions for multi-step operations

**Migration Template**:
```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Create[Entity]Table1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '[table_name]',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      '[table_name]',
      new TableIndex({
        name: 'IDX_[column_name]',
        columnNames: ['column_name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('[table_name]');
  }
}
```

**When to invoke**: Database schema changes, query optimization, migration needs

---

### 4. **API Design Agent**
**Role**: Design RESTful APIs with best practices

**Responsibilities**:
- Design API endpoints and structure
- Define request/response formats
- API versioning strategy
- Rate limiting design
- API documentation
- Response formatting standards

**API Design Principles**:
```
✅ DO:
- Use nouns for resources: /users, /orders
- Use plural nouns: /users not /user
- Use kebab-case: /user-profiles
- Nest resources: /users/:id/orders
- Use query params for filtering: /users?role=admin&status=active
- Proper HTTP methods: GET, POST, PUT, PATCH, DELETE
- Proper status codes: 200, 201, 204, 400, 401, 403, 404, 500

❌ DON'T:
- Use verbs: /getUser, /createOrder
- Mix singular/plural: /user/:id/orders
- Use camelCase: /userProfiles
- Deep nesting: /users/:id/orders/:id/items/:id
```

**Response Format Standard**:
```typescript
// Success Response
{
  "data": { /* actual data */ },
  "meta": {
    "timestamp": "2024-01-28T10:00:00Z",
    "requestId": "uuid"
  }
}

// List Response with Pagination
{
  "data": [ /* array of items */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "lastPage": 10,
    "timestamp": "2024-01-28T10:00:00Z"
  }
}

// Error Response
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 123 not found",
    "details": { /* optional additional info */ }
  },
  "meta": {
    "timestamp": "2024-01-28T10:00:00Z",
    "requestId": "uuid"
  }
}
```

**When to invoke**: Designing new APIs, API refactoring, documentation needs

---

### 5. **Security Agent**
**Role**: Ensure security best practices are implemented

**Responsibilities**:
- Authentication/Authorization implementation
- Input validation and sanitization
- Security headers configuration
- Rate limiting implementation
- Sensitive data handling
- Security audit

**Security Checklist**:
```typescript
// 1. Authentication
- [ ] JWT tokens with proper expiration
- [ ] Refresh token mechanism
- [ ] Secure password hashing (bcrypt, rounds >= 10)
- [ ] Session management

// 2. Authorization
- [ ] Role-based access control (RBAC)
- [ ] Permission-based access control
- [ ] Resource ownership validation

// 3. Input Validation
- [ ] All DTOs have validation decorators
- [ ] ValidationPipe enabled globally
- [ ] Whitelist unknown properties
- [ ] SQL injection prevention (TypeORM does this)
- [ ] XSS prevention

// 4. Security Headers
app.use(helmet());
app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

// 5. Rate Limiting
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })

// 6. Sensitive Data
- [ ] DO NOT log passwords, tokens
- [ ] Exclude sensitive fields in responses
- [ ] Environment variables for secrets
- [ ] .gitignore for sensitive files
```

**When to invoke**: Security reviews, authentication/authorization setup, security audits

---

### 6. **Testing Agent**
**Role**: Write tests and ensure code quality

**Responsibilities**:
- Write unit tests for services
- Write e2e tests for APIs
- Test coverage monitoring
- Mock dependencies
- Test data setup
- Integration testing

**Testing Standards**:
```typescript
// Unit Test Template
describe('[ServiceName]', () => {
  let service: [ServiceName];
  let repository: jest.Mocked<Repository<[Entity]>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [ServiceName],
        {
          provide: getRepositoryToken([Entity]),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<[ServiceName]>([ServiceName]);
    repository = module.get(getRepositoryToken([Entity]));
  });

  describe('create', () => {
    it('should create an entity successfully', async () => {
      const dto = { /* test data */ };
      const expectedResult = { id: 1, ...dto };
      
      repository.save.mockResolvedValue(expectedResult);
      
      const result = await service.create(dto);
      
      expect(result).toEqual(expectedResult);
      expect(repository.save).toHaveBeenCalledWith(dto);
    });

    it('should throw error when creation fails', async () => {
      repository.save.mockRejectedValue(new Error('DB Error'));
      
      await expect(service.create({})).rejects.toThrow();
    });
  });
});

// E2E Test Template
describe('[Controller] (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Apply same configuration as main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'Test1234' });
    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/[endpoint] (GET)', () => {
    return request(app.getHttpServer())
      .get('/[endpoint]')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
      });
  });
});
```

**Coverage Requirements**:
- Unit tests: >= 80% coverage
- E2E tests: All critical paths
- Focus on business logic

**When to invoke**: After implementing features, before PRs, during refactoring

---

### 7. **Performance Optimization Agent**
**Role**: Optimize application performance

**Responsibilities**:
- Identify bottlenecks
- Optimize database queries
- Implement caching strategies
- Memory usage optimization
- Response time improvement
- Load testing

**Optimization Strategies**:
```typescript
// 1. Caching
@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes
  async findAll() {
    return this.repository.find();
  }
}

// 2. Database Query Optimization
// ❌ BAD: N+1 Query Problem
const users = await this.userRepository.find();
for (const user of users) {
  user.posts = await this.postRepository.find({ where: { userId: user.id } });
}

// ✅ GOOD: Eager Loading
const users = await this.userRepository.find({
  relations: ['posts'],
});

// 3. Pagination
async findAll(page: number, limit: number) {
  return this.repository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });
}

// 4. Selective Fields
async findAll() {
  return this.repository.find({
    select: ['id', 'email', 'firstName'], // Only needed fields
  });
}

// 5. Batch Operations
async createMany(dtos: CreateUserDto[]) {
  const entities = this.repository.create(dtos);
  return this.repository.save(entities); // Bulk insert
}

// 6. Indexing
@Entity()
@Index(['email']) // Single column index
@Index(['firstName', 'lastName']) // Composite index
export class User { }

// 7. Connection Pooling
TypeOrmModule.forRoot({
  extra: {
    max: 20, // Maximum pool size
    min: 5,  // Minimum pool size
    idleTimeoutMillis: 30000,
  },
})
```

**Performance Metrics to Monitor**:
- Response time < 200ms (simple queries)
- Response time < 1s (complex queries)
- Memory usage stable
- CPU usage < 70%
- Database connection pool utilization

**When to invoke**: Performance issues, before production, optimization reviews

---

### 8. **DevOps Agent**
**Role**: Handle deployment, CI/CD, and infrastructure

**Responsibilities**:
- Docker configuration
- CI/CD pipeline setup
- Environment configuration
- Logging and monitoring setup
- Health checks
- Deployment strategies

**Docker Setup**:
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=postgres
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**CI/CD Pipeline**:
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker build -t myapp .
```

**Health Check Endpoint**:
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

**When to invoke**: Deployment setup, CI/CD configuration, infrastructure changes

---

## 🔄 Agent Collaboration Workflow

### Feature Development Flow:
```
1. Backend Architect Agent
   ↓ Design module structure & APIs
2. Database Agent
   ↓ Design schema & create migrations
3. Code Implementation Agent
   ↓ Implement controllers, services, DTOs
4. Security Agent
   ↓ Review security concerns
5. Testing Agent
   ↓ Write tests
6. Performance Optimization Agent
   ↓ Optimize if needed
7. API Design Agent
   ↓ Document APIs
8. DevOps Agent
   ↓ Setup deployment
```

### Bug Fix Flow:
```
1. Testing Agent
   ↓ Reproduce bug with test
2. Code Implementation Agent
   ↓ Fix the issue
3. Security Agent (if security-related)
   ↓ Review security implications
4. Testing Agent
   ↓ Verify fix with tests
```

### Performance Issue Flow:
```
1. Performance Optimization Agent
   ↓ Identify bottleneck
2. Database Agent (if DB-related)
   ↓ Optimize queries
3. Code Implementation Agent
   ↓ Implement optimizations
4. Testing Agent
   ↓ Verify improvements
```

---

## 📝 Communication Protocol

### Requesting Help from Agents:

**Format**:
```
@[Agent Name]

Context: [Brief description of the issue]

Requirements:
- [Requirement 1]
- [Requirement 2]

Current State:
[Code snippets if available]

Expected Outcome:
[Description of desired result]

Constraints:
- [Constraint 1]
- [Constraint 2]
```

**Example**:
```
@Backend Architect Agent

Context: Need to design an inventory management module for e-commerce

Requirements:
- Track product stock across multiple warehouses
- Real-time stock updates
- Stock reservation for pending orders
- Low stock alerts
- Stock history tracking

Current State:
Already have User module and Order module

Expected Outcome:
- Module structure
- Entity relationships
- Service layer design
- Integration with Order module

Constraints:
- Must support 10,000+ products
- Sub-second response time
- Multi-warehouse support
```

---

## 🎯 Decision Matrix

| Situation | Primary Agent | Supporting Agents |
|-----------|--------------|-------------------|
| New Feature | Backend Architect | All others in sequence |
| Bug Fix | Code Implementation | Testing |
| Performance Issue | Performance Optimization | Database, Code Implementation |
| Security Concern | Security | Code Implementation, Testing |
| API Design | API Design | Backend Architect, Code Implementation |
| Database Change | Database | Backend Architect, Code Implementation |
| Deployment | DevOps | - |
| Testing | Testing | Code Implementation |

---

## ⚡ Quick Reference Commands

```bash
# Agent invocation patterns:

# For architecture decisions:
"@Backend Architect: Design [feature-name] module with requirements [requirements]"

# For implementation:
"@Code Implementation: Implement [feature] according to existing design"

# For database work:
"@Database: Create migration for [entity-changes]"

# For API design:
"@API Design: Design endpoints for [feature] with [requirements]"

# For security review:
"@Security: Review authentication flow for [feature]"

# For testing:
"@Testing: Write unit tests and e2e tests for [feature]"

# For optimization:
"@Performance: Optimize [slow-endpoint/query]"

# For deployment:
"@DevOps: Setup deployment for [environment]"
```

---

## 📚 Best Practices for Agent Usage

1. **Be Specific**: Provide full context and requirements
2. **One Agent at a Time**: Work with one agent, complete task, then move to next
3. **Verify Output**: Always review agent output before continuing
4. **Iterate**: Agents can refine solutions through multiple iterations
5. **Document**: Keep track of decisions and rationale
6. **Test Early**: Invoke Testing Agent early and frequently
7. **Security First**: Security Agent should review all external-facing features

---

## 🔍 Agent Effectiveness Metrics

Track these to ensure agents are working effectively:

- **Code Quality**: Lint score, test coverage
- **Performance**: Response times, query efficiency
- **Security**: Security scan results, vulnerability count
- **Maintainability**: Code complexity scores
- **Documentation**: API documentation completeness
- **Test Coverage**: % of code covered by tests
