# Database Design

The project uses MongoDB with Mongoose.

## Collections

### Users

Stores application users.

Main fields:

```text
name
email
password
role
isActive
createdAt
updatedAt
```

Roles:

```text
admin
manager
agent
```

Email is unique and passwords are stored as bcrypt hashes.

---

### Teams

Stores support teams.

Main fields:

```text
name
description
members
isActive
createdAt
updatedAt
```

`members` contains references to User documents.

---

### Customers

Main fields:

```text
name
email
phone
company
location
customerType
accountStatus
createdAt
updatedAt
```

Customer type:

```text
individual
business
enterprise
```

Account status:

```text
active
inactive
suspended
```

---

### ServiceRequests

Main fields:

```text
requestNumber
customer
subject
description
category
severity
assignedTeam
assignedAgent
status
resolutionDate
resolutionNote
slaDeadline
createdAt
updatedAt
```

References:

```text
customer      -> Customer
assignedTeam  -> Team
assignedAgent -> User
```

---

### Messages

Stores customer communication and internal notes.

```text
request
author
message
type
createdAt
updatedAt
```

`type` is either:

```text
customer
internal
```

---

### Notifications

```text
recipient
type
title
message
serviceRequest
isRead
readAt
createdAt
updatedAt
```

---

### AuditLogs

Stores important application actions.

```text
user
action
entityType
entityId
description
ipAddress
userAgent
createdAt
updatedAt
```

---

### Counters

Used to create unique service request numbers.

Example:

```json
{
  "_id": "serviceRequest",
  "sequence": 10025
}
```

## Relationships

```text
Customer       1 -> many ServiceRequests
Team           1 -> many ServiceRequests
User           1 -> many assigned ServiceRequests
ServiceRequest 1 -> many Messages
User           1 -> many Notifications
User           1 -> many AuditLogs
```

## Indexing

Indexes are added on fields commonly used for search and filtering, including:

- request number
- customer
- status
- severity
- category
- assigned team
- assigned agent
- SLA deadline
- customer email/company
- notification recipient/read status
- message request/date

A few compound indexes are also used for common workload and history queries.

## Pagination

Customers, service requests and other list APIs use server-side pagination.

The API also limits the maximum page size to avoid returning very large result sets.
