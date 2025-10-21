# McShef - Home-Cooked Meals Marketplace

McShef is a full-stack web application that connects home chefs with customers looking for delicious, home-cooked meals. The platform features dual portals for customers and chefs, with Auth0 authentication and a 60/40 revenue split model.

## Features

### Customer Portal
- Browse available meals by date
- View meal details including chef information, pricing, and availability
- Place orders for meals
- Track order history
- Secure authentication via Auth0

### Chef Portal
- Create and manage meal listings
- Set pricing, quantity, and availability dates
- Track orders and revenue (60% of sales)
- View order history and customer information
- Upload optional meal images

### Platform Features
- Auth0 authentication for secure access
- In-memory database (proof of concept)
- RESTful API backend
- Responsive UI with Tailwind CSS
- Real-time inventory management
- Revenue tracking (40% platform fee, 60% to chefs)

## Tech Stack

### Backend
- FastAPI (Python)
- In-memory database
- Pydantic for data validation
- CORS enabled for frontend integration

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- Auth0 React SDK for authentication
- React Router for navigation

## Project Structure

```
mcshefdevin/
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI application with all endpoints
│   ├── pyproject.toml       # Python dependencies
│   └── poetry.lock
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── Login.tsx          # Auth0 login page
│   │   │   ├── CustomerPortal.tsx # Customer interface
│   │   │   └── ChefPortal.tsx     # Chef interface
│   │   ├── components/ui/         # shadcn/ui components
│   │   ├── App.tsx                # Main app with routing
│   │   └── main.tsx
│   ├── .env                       # Environment variables
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- Poetry (Python package manager)
- Auth0 account for authentication

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
poetry install
```

3. Start the development server:
```bash
poetry run fastapi dev app/main.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Auth0 Configuration

To enable authentication, you need to:

1. Create an Auth0 account at https://auth0.com
2. Create a new application in Auth0:
   - Application type: Single-Page Application (SPA)
   - Allowed Callback URLs: `http://localhost:5173` (for local development)
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
3. Copy your Auth0 domain and client ID to the frontend `.env` file

## API Endpoints

### Users
- `POST /api/users` - Create or get user
- `GET /api/users/{user_id}` - Get user by ID

### Chefs
- `POST /api/chefs` - Create chef profile
- `GET /api/chefs` - List all chefs
- `GET /api/chefs/{chef_id}` - Get chef by ID

### Meals
- `POST /api/meals` - Create new meal
- `GET /api/meals` - List meals (filter by chef_id or available_date)
- `GET /api/meals/{meal_id}` - Get meal by ID
- `PUT /api/meals/{meal_id}` - Update meal
- `DELETE /api/meals/{meal_id}` - Delete meal

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - List orders (filter by user_id or chef_id)
- `GET /api/orders/{order_id}` - Get order by ID

### Revenue
- `GET /api/revenue/chef/{chef_id}` - Get chef revenue summary
- `GET /api/revenue/platform` - Get platform revenue summary

## Revenue Model

- Chefs receive 60% of each sale
- Platform (McShef) receives 40% of each sale
- Revenue is automatically calculated when orders are placed

## Important Notes

- **In-Memory Database**: This is a proof of concept. All data is stored in memory and will be lost when the backend server restarts.
- **Authentication**: Auth0 credentials must be configured for the authentication to work properly.
- **Production Deployment**: For production use, replace the in-memory database with a persistent database (PostgreSQL, MongoDB, etc.)

## Development

### Running Tests
```bash
# Backend
cd backend
poetry run pytest

# Frontend
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend
poetry build
```

Frontend:
```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
