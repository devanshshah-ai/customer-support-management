# AI Usage Report

AI tools were used during the assignment for requirement review, debugging, test-case generation, code review and documentation.

ChatGPT was mainly used during development. Gemini is integrated into the application for the support-related AI features.

All AI suggestions were reviewed and tested locally before being kept in the project.

## AI Usage Examples

| Activity | Tool | Purpose | What I finally did |
| --- | --- | --- | --- |
| Requirement analysis | ChatGPT | Compared the existing project with the assignment and identified missing/partial features | Created a feature-wise implementation checklist and completed items one by one |
| Role-based access review | ChatGPT | Reviewed Admin, Manager and Agent permissions across frontend and backend | Fixed Agent request ownership and Manager read-only access for users/teams |
| Request search debugging | ChatGPT | Investigated repeated API calls and rate-limit errors while searching requests | Fixed debounce/refetch behaviour in the frontend |
| Gemini integration | ChatGPT | Investigated AI API failures after configuring the Gemini key | Updated the Gemini integration and added provider error handling |
| Request number issue | ChatGPT | Investigated duplicate MongoDB `requestNumber` errors | Replaced last-record based numbering with an atomic Counter collection |
| Integration testing | ChatGPT | Suggested missing test scenarios around authorization, customers, requests and profile | Added the relevant cases and verified them with Jest/Supertest |
| API robustness | ChatGPT | Reviewed malformed JSON, body-size limits and common error cases | Added consistent 400/413 handling in centralized error middleware |
| Dashboard analytics | ChatGPT | Investigated why category/severity labels were displayed as `Unknown` | Fixed mapping between MongoDB aggregation output and frontend chart data |
| Agent analytics | ChatGPT | Investigated why an Agent dashboard had no chart data despite assigned requests | Fixed the MongoDB ObjectId match used for Agent-scoped aggregations |
| Security review | ChatGPT | Reviewed authentication, logging, secrets and API-level protections before submission | Removed password-related request logging, verified env handling and kept security middleware enabled |

## Sample Prompts Used During Development

Below are examples of the type of prompts used while working on the project.

### 1. Requirement Review

```text
I have most of this MERN customer support assignment already built.
Can you compare the current modules against the requirement and point out
what is missing or only partially implemented?

Focus mainly on RBAC, customer history, request communication, SLA,
filters/pagination, AI features and tests. I want to finish it feature by feature
instead of rewriting working code.
```

### 2. RBAC / Request Ownership

```text
I have Admin, Manager and Agent roles.

Expected behaviour:
- Admin can manage everything
- Manager can view all requests and assign/reassign them
- Agent should only see requests assigned to that Agent

Right now some Agent APIs are still returning requests outside their scope.
Can you review where this check should live so it is enforced from the backend,
not only by hiding things in React?
```

### 3. Repeated Search API Calls

```text
My React request-list page is calling the GET /requests API too many times
when I type in the search box, and after some time I hit the rate limiter.

I already have a search state and useEffect.
Can you check the flow and suggest a proper debounce without causing another
fetch when filters/page state changes?
```

### 4. Duplicate Request Number

```text
I am getting this MongoDB error while creating service requests:

E11000 duplicate key error collection: servicerequests
index: requestNumber_1 dup key: { requestNumber: "SR-10002" }

The current logic reads the latest request number and adds 1.
What is the safest way to generate sequential request numbers in MongoDB
without duplicates if two requests are created at nearly the same time?
```

### 5. Gemini API Failure

```text
My backend is reading GEMINI_API_KEY correctly, but this endpoint:

POST /api/requests/:id/ai/summary

is returning 502 "AI provider request failed".

I want the API to return structured JSON for:
customerProblem, importantDetails, actionsTaken, currentStatus
and recommendedNextAction.

Can you review the Gemini request/response handling and make sure invalid
provider responses do not break the API?
```

### 6. Agent Dashboard Empty

```text
The Admin dashboard charts are working, but when I log in as an Agent
the summary cards have data and the charts are empty.

The Agent definitely has assigned ServiceRequest documents.
The analytics use MongoDB aggregation with assignedAgent in the match stage.

Can you check whether this could be an ObjectId/string issue and where
the conversion should happen?
```

### 7. Dashboard Showing Unknown

```text
My Requests by Category and Requests by Severity charts are rendering values
as "Unknown".

The MongoDB aggregation groups records using _id, but the React chart expects
properties like category/severity/label.

Can you check both sides and suggest the smallest change so the API response
is consistent for the chart components?
```

### 8. Test Failure Review

```text
I ran the complete Jest suite and multiple tests are failing, but some of them
look related to the same authorization behaviour.

Can you go through this test output, group the failures by root cause,
and give me one combined fix instead of changing each test individually?

Please keep existing passing behaviour unchanged.
```

### 9. API Error Handling

```text
I want the API to handle malformed JSON and very large request bodies properly.

At the moment Express/body-parser returns its own raw error messages.
Can we normalize these through the existing centralized error handler so clients get:

400 - Invalid JSON payload
413 - Request body is too large

without exposing unnecessary parser details?
```

### 10. Final Security Review

```text
Before I push this assignment to GitHub, review the backend for basic security issues.

Please check:
- password/JWT handling
- role-based authorization
- .env usage
- API keys
- request logging
- validation
- rate limiting
- body-size limits

I am not looking for enterprise security changes, just anything important
that should be fixed before an assignment submission.
```

## How AI Suggestions Were Validated

AI output was used as development assistance, not as a replacement for testing.

The general workflow was:

```text
Explain the issue
    ->
Review the suggested change
    ->
Apply only the relevant part
    ->
Run locally
    ->
Run automated/manual tests
    ->
Keep or revise the change
```

There were a few cases where an initial suggestion needed another correction after testing. For example, the Gemini integration and some authorization changes were adjusted after running the real application and test suite.

## AI Features Implemented in the Application

The application uses Gemini for three user-facing features:

### Conversation Summary

Generates:

- customer problem
- important details
- actions already taken
- current status
- recommended next action

### Response Suggestion

Generates a professional draft response based on the request and conversation.

The draft is not sent automatically. The support agent reviews and edits it before using it.

### Category and Severity Recommendation

While creating a request, Gemini can suggest:

- request category
- severity
- short reason

The user must explicitly apply the recommendation.
