# Task Management App

[![CI](https://github.com/RangaswamyChalla/taskapp/actions/workflows/ci.yml/badge.svg)](https://github.com/RangaswamyChalla/taskapp/actions/workflows/ci.yml)
[![Deploy](https://github.com/RangaswamyChalla/taskapp/actions/workflows/deploy.yml/badge.svg)](https://github.com/RangaswamyChalla/taskapp/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack task management application with user authentication, team management, and real-time task tracking.

## Tech Stack

- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express, SQLite (dev) / PostgreSQL (production)
- **Reverse Proxy:** Nginx

## Project Structure

```
taskapp/
├── backend/           # Express API server
│   ├── config/        # Database configuration
│   ├── controllers/   # Auth & Task controllers
│   ├── middleware/     # Auth, validation, error handling
│   ├── routes/        # API routes
│   ├── tests/         # Jest unit tests
│   └── server.js      # Entry point
├── frontend/          # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API service
│   │   └── config/       # App configuration
├── database/
│   └── schema.sql     # PostgreSQL schema
├── nginx/
│   └── nginx.conf     # Nginx configuration
├── .github/
│   └── workflows/     # CI/CD pipelines
└── .env.example       # Environment variables template
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

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

## Testing

```bash
cd backend
npm test
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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details.
