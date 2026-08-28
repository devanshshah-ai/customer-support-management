# Application Architecture

The application follows a standard MERN structure.

```text
React Frontend
     |
     | REST API
     v
Node.js / Express
     |
     +---- MongoDB
     |
     +---- Gemini API
```

## Frontend

The frontend is built with React.

Main responsibilities:

- routing with React Router
- shared state with Redux Toolkit
- API calls through Axios
- forms and validation
- dashboard charts
- role based navigation
- loading and error states

Main pages include:

- Login
- Dashboard
- Customers
- Service Requests
- Teams
- Users
- Notifications
- Profile
- Reports

## Backend

The backend is split into:

```text
Routes
  -> Middleware
  -> Controllers
  -> Services
  -> Mongoose Models
```

### Routes
Define API endpoints and role restrictions.

### Middleware
Handles authentication, authorization, rate limiting and common request checks.

### Controllers
Validate input, call the service layer and return responses.

### Services
Contain the main business logic such as:

- customer operations
- request assignment
- SLA calculation
- notifications
- audit logging
- dashboard queries
- AI requests

### Models
Mongoose models define collections, references, validation and indexes.

## Authentication

The user logs in with email and password.

The backend verifies the password and returns a JWT. Protected requests send the token in the Authorization header.

For authenticated requests, the backend also checks the user's current role and active status from MongoDB.

## Role Access

### Admin
Can manage users and teams, access all requests and view reports.

### Support Manager
Can view requests, teams and users, and assign or reassign requests.

### Support Agent
Can only work with assigned requests. Agents can update status, add resolution notes and add customer/internal messages.

## SLA Flow

When a request is created, the SLA deadline is calculated from severity.

```text
Critical -> 4 hours
High     -> 8 hours
Medium   -> 24 hours
Low      -> 48 hours
```

The current SLA state is calculated when requests are returned by the API.

## AI Flow

```text
Request / Conversation
        |
        v
Express AI Service
        |
        v
Gemini API
        |
        v
Validated Result
        |
        v
Frontend
```

The Gemini API key is only stored on the backend.

AI responses are validated before returning them to the frontend.

For response suggestions, the system only generates a draft. It does not automatically send a message.

## Request Number Generation

A MongoDB counter is used to generate values such as:

```text
SR-10025
```

Using an atomic counter prevents duplicate request numbers when requests are created close together.
