# Task Management App

A full-stack task management application with user authentication, team management, and real-time task tracking.

## Tech Stack

- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express, SQLite (dev) / PostgreSQL (production)
- **Reverse Proxy:** Nginx
- **Container:** Docker Compose

## Project Structure

```
taskapp/
├── backend/           # Express API server
│   ├── config/        # Database configuration
│   ├── controllers/   # Auth & Task controllers
│   ├── middleware/     # Auth, validation, error handling
│   ├── routes/        # API routes
│   ├── server.js      # Entry point
│   └── Dockerfile     # Backend container
├── frontend/          # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API service
│   │   └── config/       # App configuration
│   └── Dockerfile     # Frontend container
├── database/
│   └── schema.sql     # PostgreSQL schema
├── nginx/
│   └── nginx.conf     # Nginx configuration
├── docker-compose.yml # Full stack orchestration
└── .env.example       # Environment variables template
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Development with Docker

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d
```

The app will be available at `http://localhost`

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

## Environment Variables

See `.env.example` for required configuration.

## License

MIT
