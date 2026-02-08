# Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB Atlas account with connection string
- `.env` file configured

## Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env`:
```env
DB="your_mongodb_atlas_connection_string"
DB_TEST="your_test_database_connection_string"
JWTsecret="your_secret_key"
PORT=5000
```

### 3. Seed Database (Optional)
```bash
npm run seed
```
Creates:
- Shop: "aouina"
- Admin user: `admin@aouina.com` / `adminpass`
- Primary & Secondary accounts

### 4. Start Server
```bash
npm run dev       # Development with auto-reload
npm start         # Production
```

### 5. Access Documentation
Open browser: `http://localhost:5000/api-docs`

## Testing

```bash
npm test          # Run all 55 tests
npm test -- --watch  # Watch mode
npm test -- --coverage  # Coverage report
```

## Common Tasks

### Login & Get Token
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aouina.com",
    "password": "adminpass"
  }'
```

### Create Account (with token)
```bash
curl -X POST http://localhost:5000/api/accounts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Account",
    "deposit": 1000,
    "rate": 1.0
  }'
```

### Record Transaction
```bash
curl -X POST http://localhost:5000/api/moves \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "entrée",
    "subType": "vente",
    "amount": 500,
    "accountId": "<account_id>",
    "account": "Primary Account",
    "description": "Sale transaction"
  }'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env or kill process on port 5000 |
| Database connection error | Verify MongoDB Atlas IP whitelist and connection string |
| Tests fail | Run `npm test` - ensure DB_TEST is set |
| Swagger not loading | Check app.js has swagger middleware, restart server |

## API Response Format

### Success (200-201)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "type": "admin",
  "shop": "aouina",
  "shopId": "507f1f77bcf86cd799439012"
}
```

### Error (400-500)
```json
{
  "message": "Email already exists",
  "status": 400
}
```

## Documentation

- **Full README**: See `README.md`
- **API Docs**: Visit `/api-docs` when server is running
- **Tests**: Check `tests/api.test.js` for examples
- **Postman**: Import Swagger spec from `/api-docs.json`

## Next Steps

1. ✅ Server running? Test endpoints via Swagger UI
2. ✅ All tests passing? You're good to go!
3. ✅ Need to add features? Check tests first as examples
4. ✅ Ready to deploy? Set environment variables on server

Happy coding! 🚀
