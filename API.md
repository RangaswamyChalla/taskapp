# API Documentation

Base URL: `http://localhost:3001` (development)

## Authentication

### Register User

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Get Current User

```
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2026-03-20T10:00:00Z"
}
```

## Tasks

### List Tasks

```
GET /tasks
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | all | Filter by status |
| priority | string | all | Filter by priority |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response (200):**
```json
{
  "tasks": [...],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

### Create Task

```
POST /tasks
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the API documentation",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-03-25",
  "tags": ["api", "docs"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Complete project",
  "description": "Finish the API documentation",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-03-25",
  "tags": ["api", "docs"],
  "creator_id": "uuid",
  "created_at": "2026-03-20T10:00:00Z",
  "updated_at": "2026-03-20T10:00:00Z"
}
```

### Get Task

```
GET /tasks/:id
Authorization: Bearer <token>
```

### Update Task

```
PUT /tasks/:id
Authorization: Bearer <token>
```

**Request Body:** (partial update supported)
```json
{
  "status": "in_progress",
  "assignee_id": "uuid"
}
```

### Delete Task

```
DELETE /tasks/:id
Authorization: Bearer <token>
```

## Task Statuses

- `todo` - Task created but not started
- `in_progress` - Task is being worked on
- `review` - Task complete, under review
- `done` - Task finished
- `cancelled` - Task cancelled

## Task Priorities

- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `urgent` - Urgent/emergency

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": ["email is required"]
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```
