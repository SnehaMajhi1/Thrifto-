# Thrifto API Contract (v1 — Draft)

Base URL (dev): `http://localhost:5000/api`

Notes
- This is a **contract-first** draft so Frontend and Backend can be built in parallel.
- For now, endpoints may return placeholder responses until DB/auth are implemented.

## Health
### GET /health
Returns service status.

Response (200)
```json
{
  "status": "ok",
  "service": "Thrifto Backend",
  "timestamp": "2026-02-15T00:00:00.000Z",
  "db": { "connected": false, "reason": "Database not configured (setup phase)" }
}
```

## Auth (Role-based)
### POST /auth/register
Creates a user account.

### POST /auth/login
Authenticates user and returns token/session.

### GET /auth/me
Returns the current authenticated user.

## Users
### GET /users
List users (admin only).

### GET /users/:id
Get a single user profile.

### PATCH /users/:id
Update user profile.

### DELETE /users/:id
Delete user (admin only).

## Clothes (Items)
### GET /clothes
List thrift/swap items.

### POST /clothes
Create a new clothing item.

### GET /clothes/:id
Get item details.

### PATCH /clothes/:id
Update item.

### DELETE /clothes/:id
Delete item.

## Posts (Social Feed)
### GET /posts
Get feed posts.

### POST /posts
Create a post (photo + caption).

### GET /posts/:id
Get a post.

### DELETE /posts/:id
Delete a post.

## Donations
### GET /donations
List donations (user/admin scoped).

### POST /donations
Create donation request/record.

## Swaps
### GET /swaps
List swap requests.

### POST /swaps
Create swap request.

### PATCH /swaps/:id
Update swap status (pending/accepted/rejected/completed).

## Chat
### GET /chats
List chat threads.

### GET /chats/:id/messages
List messages.

### POST /chats/:id/messages
Send message.

## Admin
### GET /admin/stats
Basic analytics for dashboard.
