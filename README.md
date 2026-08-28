# Customer Support Management System

A MERN stack application for managing customers, service requests, support teams, communication, SLA tracking, notifications and basic support analytics.

The application supports three roles: Admin, Support Manager and Support Agent.

## Features

- JWT based login and role based access
- Customer management and service history
- Service request creation, assignment and tracking
- Customer responses and internal notes
- SLA tracking based on severity
- Dashboard with request and workload analytics
- Search, filters, sorting and pagination
- Notifications and profile management
- AI conversation summary
- AI response suggestion
- AI category and severity recommendation
- Audit logs
- Unit and integration tests

## Tech Stack

### Frontend
- React.js
- Redux Toolkit
- React Router
- Axios
- Recharts
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod

### AI
- Google Gemini API

### Testing
- Jest
- Supertest

## Project Structure

```text
customer-support-management/
├── backend/
│   ├── src/
│   ├── tests/
│   └── .env.example
├── frontend/
│   ├── src/
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DESIGN.md
│   ├── TESTING.md
│   └── AI_USAGE_REPORT.md
└── README.md
```

## Setup

### Backend

```bash
cd backend
npm install
```

Create `.env` using `.env.example`.

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Start the backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Seed Data

Demo data can be created using:

```bash
cd backend
npm run seed
```

The seed script creates sample users, teams, customers, service requests, messages and notifications.

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@example.com | Password@123 |
| Manager | manager@example.com | Password@123 |
| Agent | priya.agent@example.com | Password@123 |

> The seed command clears existing application data in the configured database before adding demo data.

## SLA Rules

| Severity | Target |
| --- | --- |
| Critical | 4 hours |
| High | 8 hours |
| Medium | 24 hours |
| Low | 48 hours |

The system shows whether a request is within SLA, approaching the deadline, breached, resolved within SLA or resolved after SLA.

## AI Features

### Conversation Summary
Generates a short summary of the request conversation including the problem, important details, previous actions, current status and next suggested action.

### Response Suggestion
Generates a draft customer response. The agent can review and edit the text before using it.

### Category and Severity Suggestion
While creating a request, AI can recommend a category and severity. The user decides whether to apply the suggestion.

## Testing

Run backend tests:

```bash
cd backend
npm test
```

Latest result:

```text
Test Suites: 10 passed, 10 total
Tests:       76 passed, 76 total
```

Coverage can be generated with:

```bash
npm run test:coverage
```

See [Testing](docs/TESTING.md) for a short summary.

## Security

Basic security measures used in the project:

- bcrypt password hashing
- JWT authentication
- role based authorization
- backend request validation
- Helmet
- rate limiting
- request body size limit
- environment variables for secrets
- backend-only Gemini API key
- centralized API error handling

## Database and Performance

MongoDB indexes are used on commonly searched and filtered fields such as request number, customer, status, severity, team, agent and created date.

Server-side pagination is used for customer and service-request lists.

Request numbers are generated using an atomic counter to avoid duplicate values when multiple requests are created at the same time.

## Documentation

- [Application Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [Testing](docs/TESTING.md)
- [AI Usage Report](docs/AI_USAGE_REPORT.md)

## Supporting Files

The final submission also includes:

- Postman collection
- `.env.example`
- sample seed data
- application screenshots

