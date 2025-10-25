# PCN API Server

Backend API for the PCN Vehicle Selling System.

## API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Sales
- `GET /api/sales` - Get all sales transactions
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create new sale

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/sales` - Get sales analytics

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Supabase (PostgreSQL)
- JWT Authentication
- Helmet (Security)
- Morgan (Logging)

## Running Locally

```bash
cd api
npm install
cp .env.example .env
# Update environment variables
npm run dev
```

The API will be available at http://localhost:4000

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for required variables.
