# User Service - Communication Contract

## Overview

The User Service is a RESTful API microservice that handles user authentication, authorization, and user profile management. It uses JWT (JSON Web Tokens) for authentication with access and refresh token mechanisms, and includes multi-factor authentication (MFA) support via phone number verification.

**Base URL**: `http://localhost:3000`

## Running the Service

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Or run normally
node index.js
```

The service will start on `http://localhost:3000` by default.

---

## API Endpoints

### 1. Create User (Register)

**Endpoint**: `POST /auth/createUser`

**Description**: Create a new user account. This endpoint hashes the password, generates an MFA token, and returns JWT tokens.

**Request Body**:

```json
{
  "username": "string (required)",
  "password": "string (required)",
  "phoneNumber": "string (required)"
}
```

**Example Request**:

```javascript
const response = await fetch("http://localhost:3000/auth/createUser", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "johndoe",
    password: "securePassword123",
    phoneNumber: "555-123-4567",
  }),
});

const data = await response.json();
console.log(data);
```

**Example Response** (201 Created):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "phoneNumber": "555-123-4567",
    "mfaToken": "123456"
  }
}
```

**Response Details**:

- Sets `refreshToken` in an HTTP-only cookie (expires in 7 days)
- Returns `accessToken` in response body (expires in 15 minutes)
- Returns MFA token for verification (send this to user's phone)

**Error Response** (400 Bad Request):

```json
{
  "message": "Username already in use."
}
```

---

### 2. MFA Verification

**Endpoint**: `POST /auth/MFA-check`

**Description**: Verify the MFA token sent to the user's phone. If verification fails, the user account is deleted.

**Request Body**:

```json
{
  "mfaInput": "string (the code user received)",
  "mfaToken": "string (the original token from createUser response)"
}
```

**Example Request**:

```javascript
const response = await fetch("http://localhost:3000/auth/MFA-check", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mfaInput: "123456",
    mfaToken: "123456",
  }),
});

const data = await response.json();
console.log(data);
```

**Example Response** (201 Created):

```json
{
  "message": "MFA Verified"
}
```

**Error Response** (400 Bad Request):

```json
{
  "error": "MFA Failed"
}
```

**Important**: If MFA verification fails, the user account is automatically deleted and the user must register again.

---

### 3. Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticate a user with username and password. Returns JWT tokens and user information.

**Request Body**:

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Example Request**:

```javascript
const response = await fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Important: include cookies
  body: JSON.stringify({
    username: "johndoe",
    password: "securePassword123",
  }),
});

const data = await response.json();
console.log(data);
```

**Example Response** (200 OK):

```json
{
  "message": "User successfully logged in",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "username": "johndoe",
    "phoneNumber": "555-123-4567",
    "avatarURL": "https://www.freeiconspng.com/img/898",
    "userBio": null,
    "mfaToken": null,
    "createdAt": "2025-11-14 12:00:00",
    "updatedAt": "2025-11-14 12:00:00"
  }
}
```

**Response Details**:

- Sets `refreshToken` in an HTTP-only cookie (expires in 7 days)
- Returns `accessToken` in response body (expires in 15 minutes)
- Password field is excluded from user object

**Error Response** (400 Bad Request):

```json
{
  "error": "Invalid credentials"
}
```

---

### 4. Logout

**Endpoint**: `POST /auth/logout`

**Description**: Log out the current user by clearing the refresh token cookie.

**Example Request**:

```javascript
const response = await fetch("http://localhost:3000/auth/logout", {
  method: "POST",
  credentials: "include", // Important: include cookies
});

const data = await response.json();
console.log(data);
```

**Example Response** (200 OK):

```json
{
  "message": "Logged out successfully"
}
```

---

### 5. Refresh Token

**Endpoint**: `POST /auth/refresh-token`

**Description**: Get a new access token using the refresh token stored in cookies. Call this endpoint when the access token expires (after 15 minutes).

**Example Request**:

```javascript
const response = await fetch("http://localhost:3000/auth/refresh-token", {
  method: "POST",
  credentials: "include", // Important: include cookies to send refreshToken
});

const data = await response.json();
console.log(data);
```

**Example Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response** (401 Unauthorized):

```json
{
  "error": "Invalid token"
}
```

or

```json
{
  "error": "invalid or expired refresh token"
}
```

**Important**: If the refresh token is invalid or expired, the refresh token cookie is cleared and the user must log in again.

---

### 6. Get User

**Endpoint**: `GET /auth/user/:userId`

**Description**: Retrieve a user's public profile information by their user ID.

**Parameters**:

- `userId` (path parameter, integer): The unique identifier of the user

**Example Request**:

```javascript
const response = await fetch("http://localhost:3000/auth/user/1");
const userData = await response.json();
console.log(userData);
```

**Example Response** (200 OK):

```json
{
  "username": "johndoe",
  "avatarURL": "https://www.freeiconspng.com/img/898",
  "phoneNumber": "555-123-4567",
  "userBio": "I love gaming!"
}
```

**Error Response** (404 Not Found):

```json
{
  "error": "User not found"
}
```

---

### 7. Update User

**Endpoint**: `PUT /auth/updateUser/:userId`

**Description**: Update a user's profile information.

**Parameters**:

- `userId` (path parameter, integer): The unique identifier of the user

**Request Body**:

```json
{
  "username": "string",
  "avatarURL": "string",
  "phoneNumber": "string",
  "userBio": "string"
}
```

**Example Request**:

```javascript
const response = await fetch("http://localhost:3000/auth/updateUser/1", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "johndoe_updated",
    avatarURL: "https://example.com/avatar.jpg",
    phoneNumber: "555-987-6543",
    userBio: "Updated bio text",
  }),
});

const data = await response.json();
console.log(data);
```

**Example Response** (200 OK):

```json
{
  "message": "User updated successfully"
}
```

**Error Response** (400 Bad Request):

```json
{
  "error": "Failed to update user"
}
```

---

## How to REQUEST Data

### Authentication Flow

**Step 1: User Registration**

```javascript
// 1. Create a new user
const registerResponse = await fetch("http://localhost:3000/auth/createUser", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    username: "newuser",
    password: "password123",
    phoneNumber: "555-0000",
  }),
});

const registerData = await registerResponse.json();

// 2. Send MFA token to user's phone (implement with SMS service)
// Client Side

// 3. User enters MFA code, verify it
const mfaResponse = await fetch("http://localhost:3000/auth/MFA-check", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mfaInput: "123456", // Code user entered
    mfaToken: registerData.user.mfaToken,
  }),
});

// 4. Store the access token
const accessToken = registerData.accessToken;
```

**Step 2: Login for Existing Users**

```javascript
const loginResponse = await fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // REQUIRED: allows cookies to be sent/received
  body: JSON.stringify({
    username: "johndoe",
    password: "password123",
  }),
});

const loginData = await loginResponse.json();

// Store access token in memory (NOT localStorage for security)
const accessToken = loginData.accessToken;
const user = loginData.user;
```

**Step 3: Making Authenticated Requests to Other Services**

```javascript
// Use the access token to access protected routes in other microservices
const response = await fetch("http://localhost:5000/protected-route", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// If you get a 401 error, refresh the token
if (response.status === 401) {
  // Get new access token
  const refreshResponse = await fetch(
    "http://localhost:3000/auth/refresh-token",
    {
      method: "POST",
      credentials: "include",
    }
  );

  const refreshData = await refreshResponse.json();
  const newAccessToken = refreshData.accessToken;

  // Retry the original request with new token
  const retryResponse = await fetch("http://localhost:5000/protected-route", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${newAccessToken}`,
    },
  });
}
```

**Step 4: Logout**

```javascript
await fetch("http://localhost:3000/auth/logout", {
  method: "POST",
  credentials: "include",
});

// Clear access token from memory
accessToken = null;
user = null;
```

---

## How to RECEIVE Data

All endpoints return JSON-formatted data with appropriate HTTP status codes.

**HTTP Status Codes**:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully (user registration, MFA verification)
- `400 Bad Request`: Invalid request data or credentials
- `401 Unauthorized`: Missing, invalid, or expired token
- `404 Not Found`: Resource not found (user doesn't exist)

**Cookies**:
The service uses HTTP-only cookies to store refresh tokens. These cookies:

- Are automatically sent with requests when using `credentials: "include"`
- Cannot be accessed via JavaScript (security feature)
- Expire after 7 days
- Are cleared on logout or when refresh fails

**Example: Handling Responses in JavaScript**

```javascript
// Login and handle response
const response = await fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ username: "user", password: "pass" }),
});

// Check if request was successful
if (response.ok) {
  const data = await response.json();

  // Access the data
  const accessToken = data.accessToken;
  const userId = data.user.userId;
  const username = data.user.username;

  // Store in state management
  setAccessToken(accessToken);
  setUser(data.user);
} else {
  // Handle errors
  const error = await response.json();
  console.error("Login failed:", error.error);
}
```

**Example: Auto-Refresh Token Pattern**

```javascript
// Function to make authenticated requests with auto-refresh
async function fetchWithAuth(url, options = {}) {
  // Add Authorization header
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  let response = await fetch(url, options);

  // If unauthorized, try refreshing the token
  if (response.status === 401) {
    const refreshResponse = await fetch(
      "http://localhost:3000/auth/refresh-token",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      accessToken = refreshData.accessToken;

      // Retry original request with new token
      options.headers["Authorization"] = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    } else {
      // Refresh failed, redirect to login
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  return response;
}

// Usage
const response = await fetchWithAuth("http://localhost:5000/api/data");
const data = await response.json();
```

---

## Data Model

### User Object

| Field         | Type      | Description                                                          |
| ------------- | --------- | -------------------------------------------------------------------- |
| `userId`      | integer   | Unique user identifier (auto-increment primary key)                  |
| `username`    | string    | Unique username (required)                                           |
| `password`    | string    | Hashed password using bcrypt (required, never returned)              |
| `phoneNumber` | string    | User's phone number for MFA (required)                               |
| `avatarURL`   | string    | URL to user's avatar image (default provided)                        |
| `userBio`     | string    | User's biography/description (optional)                              |
| `mfaToken`    | string    | Temporary 6-digit MFA verification code (cleared after verification) |
| `createdAt`   | timestamp | Account creation timestamp (auto-generated)                          |
| `updatedAt`   | timestamp | Last update timestamp (auto-generated)                               |

### JWT Token Structure

**Access Token** (expires in 15 minutes):

```json
{
  "userId": 1,
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Refresh Token** (expires in 7 days):

```json
{
  "userId": 1,
  "iat": 1234567890,
  "exp": 1235172690
}
```

---

## Environment Variables

Create a `.env` file with the following variables:

```env
MFA_TOKEN = 123456
ACCESS_TOKEN_SECRET=your-secret-key-for-access-tokens
REFRESH_TOKEN_SECRET=your-secret-key-for-refresh-tokens
```

**IMPORTANT**:

- Use strong, random secret keys
- Never commit `.env` file to version control
- Use the same `ACCESS_TOKEN_SECRET` across all microservices that need to verify tokens

---
## UML Diagram (createUser endpoint)
![UML Diagram](./images/UML-createUser.png)
This diagram shows the gist of how the createUser endpoint works. It requires the user to supply their intended username, their password (will be hashed when it hits the database), and their phone number.
Once the user is created, MFA check triggers, sending a randomly generated MFA token, the user's phoneNumber, and their userId to the client. If the user inputs the MFA token correctly, user row stays, else delete.
If MFACheck passes, route user to user profile page.
