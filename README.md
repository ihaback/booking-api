# Booking API
Simple booking api attempt with [Typescript](https://www.typescriptlang.org), [Express](https://expressjs.com), [TypeORM](https://typeorm.io) and [Postgres](https://www.postgresql.org).
Testing with [Jest](https://jestjs.io) &  [Supertest](https://github.com/visionmedia/supertest).

# Prerequisites
- Node
- Docker

# Project setup
```
npm install
```

# Rename .env.example to env

Change `NODE_ENV` to `prod` if you want to test building prod version locally.

```yaml
NODE_ENV=dev
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_INSTANCE=postgres
DB_SYNCHRONIZE=true
JWT_SECRET=secret
```

# Run docker compose for Postgres DB
```
docker-compose up
```

# Start dev server and seed database with initial data
```
npm run dev
```

# Run tests against Postgres DB with jest & supertest
```
npm run test
```

# Lint code to detect issues
```
npm run lint
```
# Build code for production
Make sure your `NODE_ENV` is set to `prod`.
```
npm run build
```

# Login to receive jwt token for subsequent request

```bash
POST http://localhost:3000/api/auth/login
```
```json
{
    "username": "admin",
    "password": "admin"
}
```
### Use token from login repsone in the auth header for subsequent request
```
generated-token
```

# Create booking

```bash
POST http://localhost:3000/api/bookings
```
```json
{
	"startDate": "2022-03-24 18:46:55.223294",
	"endDate": "2022-03-24 18:46:55.223294",
	"cost": 100,
	"destinationId": 1
}
```
# Get all bookings

```bash
GET http://localhost:3000/api/bookings
```

# Get single booking

```bash
GET http://localhost:3000/api/bookings/:id
```

# Update booking

```bash
PUT http://localhost:3000/api/bookings/:id
```
```json
{
	"startDate": "2022-03-24 18:46:55.223294",
	"endDate": "2022-03-24 18:46:55.223294",
	"cost": 10000
}
```
# Delete booking

```bash
DELETE http://localhost:3000/api/bookings/:id
```
# Create destination
```bash
POST http://localhost:3000/api/destinations
```
```json
  {
    "name": "New York",
    "description": "description",
    "state": "New York",
    "city": "New York",
    "cost": 100,
    "maxGuests": 2,
    "available": true
  }
```


# Get all destinations

```bash
GET http://localhost:3000/api/destinations
```

# Get single destination

```bash
GET http://localhost:3000/api/destinations/:id
```

# Update destination

```bash
PUT http://localhost:3000/api/destinations/:id
```
```json
{
	"name": "Los Angeles",
	"state": "California",
	"city": "Los Angeles",
	"cost": 100,
	"maxGuests": 2
}
```
# Delete destination

```bash
DELETE http://localhost:3000/api/destinations/:id
```
