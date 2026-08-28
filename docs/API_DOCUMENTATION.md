# API Documentation

Base URL:

```text
http://localhost:5000/api
```

Protected APIs use:

```http
Authorization: Bearer <token>
```

## Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Login |

Login example:

```json
{
  "email": "admin@example.com",
  "password": "Password@123"
}
```

## Customers

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/customers` | Create customer |
| GET | `/customers` | List/search customers |
| GET | `/customers/:id` | Customer details and service history |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |

Create example:

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1 212 555 0199",
  "company": "ABC Inc",
  "location": "New York",
  "customerType": "business",
  "accountStatus": "active"
}
```

Customer list supports:

```text
search
customerType
accountStatus
page
limit
sortBy
sortOrder
```

## Service Requests

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/requests` | Create request |
| GET | `/requests` | List/search/filter requests |
| GET | `/requests/:id` | Request details |
| PUT | `/requests/:id` | Update request |
| DELETE | `/requests/:id` | Delete request |

Create example:

```json
{
  "customer": "CUSTOMER_ID",
  "subject": "Payment webhook timeout",
  "description": "Webhook requests are timing out.",
  "category": "Technical Issue",
  "severity": "High",
  "status": "Open"
}
```

Request list supports:

```text
search
status
severity
category
assignedTeam
assignedAgent
startDate
endDate
page
limit
sortBy
sortOrder
```

Resolve example:

```json
{
  "status": "Resolved",
  "resolutionNote": "Configuration was corrected and verified."
}
```

## Messages

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/requests/:id/messages` | Add response or internal note |
| GET | `/requests/:id/messages` | Conversation history |

Customer response:

```json
{
  "message": "We have identified the issue and are working on it.",
  "type": "customer"
}
```

Internal note:

```json
{
  "message": "Escalated to engineering.",
  "type": "internal"
}
```

## Dashboard

| Method | Endpoint |
| --- | --- |
| GET | `/dashboard/summary` |
| GET | `/dashboard/analytics` |

The dashboard returns summary counts, category/severity breakdown, workload and average resolution time.

## AI

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/requests/:id/ai/summary` | Conversation summary |
| POST | `/requests/:id/ai/suggest-response` | Suggested customer response |
| POST | `/requests/ai/analyze` | Category and severity recommendation |

AI analysis example:

```json
{
  "subject": "Checkout API unavailable",
  "description": "All checkout requests return HTTP 503."
}
```

## Other APIs

The application also contains APIs for:

- `/users`
- `/teams`
- `/profile`
- `/notifications`
- `/audit-logs`

These are used by their matching frontend modules.

## Common Status Codes

| Code | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 400 | Validation / bad request |
| 401 | Authentication required |
| 403 | Not allowed |
| 404 | Not found |
| 409 | Conflict / duplicate |
| 413 | Request too large |
| 429 | Too many requests |
| 500 | Server error |
| 502/504 | AI provider error or timeout |

For ready-to-run examples, see the Postman collection included with the submission.
