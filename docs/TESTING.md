# Testing

Backend testing is done with Jest and Supertest.

## Test Coverage

Tests are included for:

- authentication
- authorization
- customers
- service requests
- messages
- notifications
- profile
- SLA calculation
- AI APIs
- common API error cases

Both unit tests and API/integration tests are included.

## Run Tests

```bash
cd backend
npm test
```

Latest result:

```text
Test Suites: 10 passed, 10 total
Tests:       76 passed, 76 total
Snapshots:   0 total
```

## Coverage

```bash
npm run test:coverage
```

Latest overall coverage:

| Metric | Result |
| --- | --- |
| Statements | 67.11% |
| Branches | 48.41% |
| Functions | 71.83% |
| Lines | 67.14% |

## Main Scenarios Checked

Some of the important scenarios covered by the test suite are:

- valid and invalid login
- duplicate registration
- inactive user login
- Agent cannot access another Agent's request
- Agent cannot change assignment/request details
- Agent can update status and resolution note
- request search/filter/pagination
- SLA calculations
- customer validation and duplicate email
- profile password change
- malformed JSON
- request body limit
- Gemini provider error and invalid AI response

Some tests intentionally call APIs with invalid input, so error logs may appear in the console even when the test passes.
