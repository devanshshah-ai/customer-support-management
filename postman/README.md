# Postman Collection

Import:

`Customer-Support-Management.postman_collection.json`

Collection variables:

```text
baseUrl = http://localhost:5000/api
token =
customerId =
requestId =
```

Suggested order:

1. Login
2. Create Customer
3. Search Customers
4. Create Service Request
5. Search / Filter Requests
6. Request Details
7. Add Customer Response
8. Conversation History
9. Dashboard Summary
10. Dashboard Analytics
11. AI Conversation Summary
12. AI Response Suggestion
13. AI Category and Severity Recommendation
14. Update / Resolve Request

After Login, copy `data.token` into the `token` collection variable.

After Create Customer, copy the new customer `_id` into `customerId`.

After Create Service Request, copy the new request `_id` into `requestId`.
