# Revenue API

A comprehensive REST API for managing shop revenue, accounts, financial moves, and transaction history.

## Features

- 🔐 **User Management** - Register, login, and manage users with role-based access
- 💰 **Account Management** - Create and manage primary/secondary accounts
- 📊 **Financial Tracking** - Record sales, expenses, gains, deposits, and withdrawals
- 📈 **Revenue Reports** - Generate revenue reports by date range
- 📝 **Transaction History** - Complete audit trail of all transactions
- 💾 **Data Backup** - Export shop data for backup

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database (Atlas)
- **JWT** - Authentication
- **Jest** - Testing framework
- **Swagger** - API documentation

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd revenue-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration:
```env
DB="mongodb+srv://user:password@cluster.mongodb.net/revenue?appName=cluster0"
DB_TEST="mongodb+srv://user:password@cluster.mongodb.net/revenue-test?appName=cluster0"
JWTsecret="your_jwt_secret"
PORT=5000
```

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

5. Access API documentation:
```
http://localhost:5000/api-docs
```

## API Documentation

Interactive API documentation is available at `/api-docs` using Swagger UI.

### Base URL
- Development: `http://localhost:5000/api`

### Authentication

All endpoints (except `/users/login`) require a JWT token in the Authorization header:

```bash
Authorization: Bearer <token>
```

### Core Endpoints

#### Users
- `POST /users/register` - Register new user (admin only)
- `POST /users/login` - Login and get JWT token
- `GET /users` - Get all users in shop
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

#### Accounts
- `POST /accounts` - Create account (admin only)
- `GET /accounts` - Get all accounts in shop
- `PUT /accounts/:id` - Update account (admin only)
- `DELETE /accounts/:id` - Delete account (admin only)

#### Shops
- `POST /shops` - Create shop (admin only)
- `GET /shops` - Get all shops
- `GET /shops/:id` - Get shop by ID
- `PUT /shops/:id` - Update shop (admin only)
- `DELETE /shops/:id` - Delete shop (admin only)

#### Moves (Transactions)
- `POST /moves` - Record a transaction
- `GET /moves/:period/:subType` - Get moves by period and type
- `GET /moves/revenue/:start/:end/:user` - Get revenue report for date range
- `PUT /moves/:id` - Update move (admin only)
- `DELETE /moves/:id` - Delete move
- `DELETE /moves/manual/:id` - Manually delete move (admin only)

#### History
- `GET /history/:start/:end` - Get transaction history (admin only)
- `POST /history` - Create history entry

#### Backup
- `GET /backup` - Export shop data (admin only)

## Testing

Run the test suite:

```bash
npm test
```

### Test Coverage

✅ 55 comprehensive tests covering:
- User authentication and authorization
- CRUD operations for all resources
- Authorization checks (admin vs user)
- Error handling
- Transaction logic
- Revenue calculations

### Database Seeding

Initialize the database with sample data:

```bash
npm run seed
```

This creates:
- A test shop
- An admin user (email: `admin@aouina.com`, password: `adminpass`)
- Primary and secondary accounts with initial deposit

## Project Structure

```
├── controllers/          # Route handlers
├── services/            # Business logic
├── repositories/        # Database access layer
├── models/              # Mongoose schemas
├── middlewares/         # Express middlewares
├── helpers/             # Utility functions
├── errors/              # Custom error classes
├── tests/               # Test files
├── scripts/             # Utility scripts (seed.js)
├── app.js               # Express app setup
├── index.js             # Entry point
├── swagger.js           # Swagger configuration
├── jest.config.js       # Jest configuration
└── package.json         # Dependencies
```

## Development Workflow

```bash
# Start development server with hot-reload
npm run dev

# Run tests
npm test

# Seed database
npm run seed

# View API documentation
# Open http://localhost:5000/api-docs
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB` | MongoDB connection string (production) |
| `DB_TEST` | MongoDB connection string (testing) |
| `JWTsecret` | Secret key for JWT signing |
| `PORT` | Server port (default: 5000) |

## Error Handling

The API uses consistent error responses:

```json
{
  "message": "Error message",
  "status": 400
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## User Roles

### Admin
- Can register users
- Can create/update/delete accounts
- Can create/update/delete shops
- Can view history and backup data
- Can manage all records

### User
- Can view accounts and shops
- Can create transaction moves
- Can delete own transactions

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- MongoDB Atlas secure connection
- CORS enabled
- Input validation

## Performance

- Database indexing on frequently queried fields
- Response pagination (where applicable)
- Connection pooling with MongoDB
- Efficient query filtering

## Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit a pull request

## Testing Guidelines

- All new features must include tests
- Run `npm test` before committing
- Aim for >80% code coverage
- Test both success and error cases

## Deployment

### Prerequisites
- Node.js server (e.g., Heroku, AWS, DigitalOcean)
- MongoDB Atlas account
- Environment variables configured

### Steps

1. Build and deploy:
```bash
git push heroku main  # if using Heroku
```

2. Set environment variables on server
3. Run migrations if needed
4. Verify API at `/api-docs`

## Troubleshooting

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes your server IP
- Check connection string format
- Ensure DB_TEST and DB environment variables are set

### Authentication Errors
- Verify JWT token is included in Authorization header
- Check token hasn't expired
- Ensure JWTsecret is correct

### Test Failures
- Ensure DB_TEST points to test database
- Run `npm run test` to execute full suite
- Check database is accessible

## License

MIT License - feel free to use this project

## Support

For issues or questions, create an issue on the repository.

## Changelog

### v1.0.0 (2026-02-08)
- Initial release
- Full REST API
- Comprehensive test suite (55 tests)
- Swagger documentation
- Database seeding script
