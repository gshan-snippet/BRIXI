# Home Helper Hub - Complete Backend Implementation

## Overview
This is a complete home helper booking platform with backend and frontend integration. It includes:
- **Operator/Manager Account**: Single account to manage all services and receive customer messages
- **Consumer Accounts**: Regular users who can book services and communicate with the operator
- **Post Management**: Operators can create posts showcasing their work (before/after photos)
- **Messaging System**: Real-time communication between operators and consumers
- **Appointment Booking**: Consumers can request appointments with specific details

---

## System Architecture

### Backend Stack
- **Framework**: Node.js + Express.js
- **Database**: Local JSON file-based storage
- **Port**: 3001
- **Key Features**: Authentication, Posts, Messages, Appointments

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **Routing**: React Router v6
- **Port**: 8081 (Vite dev server)

---

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or bun package manager

### Backend Setup

```bash
cd backend
npm install
npm run dev
# Server will run on http://localhost:3001
```

### MVP Deployment Notes (Railway)
- Set `PORT` to the Railway-provided port (Railway injects `PORT` automatically).
- Set `CORS_ORIGIN` to your Vercel frontend URL (e.g., https://your-app.vercel.app).
- For persistent storage of JSON DB and uploads, attach a Railway Volume and set:
  - `DATA_DIR=/data/database`
  - `UPLOADS_DIR=/data/uploads`

### Frontend Setup

```bash
# From project root
npm install
npm run dev
# App will run on http://localhost:8081
```

---

## Default Credentials

### Operator Account
```
Email: asifkazi369@gmail.com
Password: CONSCIENTIOUS
Role: operator
```

**Note**: This is the ONLY operator account in the system. All messages and appointments from consumers go to this operator.

---

## User Roles & Features

### 1. Operator/Manager Features
- ✅ Create posts (service showcase with before/after photos)
- ✅ View all incoming messages from consumers
- ✅ View appointment requests  
- ✅ Chat with consumers
- ✅ Manage profile

**Navigation**: Home → Post (create) → Messages (view all consumer messages) → Profile

### 2. Consumer Features
- ✅ View all available posts from operator
- ✅ Browse workers/services
- ✅ Book appointments with location and time details
- ✅ Message the operator
- ✅ Manage profile

**Navigation**: Home (posts feed) → Workers (book service) → Messages (chat with operator) → Profile

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user (operator or consumer)
- `POST /api/auth/register` - Register new consumer account
- `GET /api/auth/users` - Get all users (for testing)

### Posts
- `POST /api/posts/create` - Create new post (operator only)
  - Required fields: operatorId, typeOfWork, beforeImage, afterImage, hoursWorked
- `GET /api/posts/all` - Get all posts
- `GET /api/posts/operator/:operatorId` - Get operator's posts

### Messages
- `POST /api/messages/send` - Send text message from consumer to operator
- `POST /api/messages/appointment` - Send appointment request
- `GET /api/messages/operator/:operatorId` - Get all messages for operator
- `GET /api/messages/conversation/:operatorId/:userId` - Get conversation between operator and user

---

## Database Structure

### Users Collection
```json
{
  "id": "UUID",
  "email": "string",
  "password": "string",
  "name": "string",
  "phone": "string",
  "role": "operator | consumer",
  "createdAt": "ISO timestamp"
}
```

### Posts Collection
```json
{
  "id": "UUID",
  "operatorId": "string",
  "typeOfWork": "string",
  "beforeImage": "URL path",
  "afterImage": "URL path",
  "hoursWorked": "number",
  "userRating": "number",
  "createdAt": "ISO timestamp"
}
```

### Messages Collection
```json
{
  "id": "UUID",
  "operatorId": "string",
  "userId": "string",
  "userName": "string",
  "messageText": "string",
  "type": "message | appointment",
  "createdAt": "ISO timestamp"
}
```

### Appointments Collection
```json
{
  "id": "UUID",
  "operatorId": "string",
  "userId": "string",
  "userName": "string",
  "userPhone": "string",
  "appointmentDate": "string",
  "location": "string",
  "workingHours": "string",
  "typeOfWork": "string",
  "status": "pending | confirmed | completed",
  "createdAt": "ISO timestamp"
}
```

---

## Workflow Examples

### Example 1: Consumer Booking Appointment
1. Consumer logs in (creates account or uses existing)
2. Navigates to "Workers" tab
3. Clicks on a service (e.g., Plumber)
4. Fills in:
   - Appointment Date
   - Current Location
   - Preferred Working Hours
5. Clicks "Confirm Booking"
6. Appointment request sent to operator
7. Message appears in operator's inbox with all details:
   - Username
   - Phone number
   - Appointment date
   - Location
   - Working hours
   - Type of work

### Example 2: Operator Creating Post
1. Operator logs in with asifkazi369@gmail.com
2. Navigates to "Post" tab
3. Enters:
   - Type of Work (e.g., "Bathroom Renovation")
   - Before photo
   - After photo
   - Hours worked
   - User rating (optional)
4. Clicks "Upload Post"
5. Post appears immediately on all consumers' home page

### Example 3: Consumer Viewing Posts
1. Consumer logs in
2. Home page shows all operator posts as cards
3. Each card displays:
   - Before/After photos side-by-side
   - Type of work
   - Hours worked
   - User rating
4. Click "Book Now" to book the service

---

## File Structure
```
project-root/
├── backend/
│   ├── server.js                 # Main server file
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── posts.js             # Post management routes
│   │   └── messages.js          # Messaging routes
│   ├── database/
│   │   ├── db.js                # Database operations
│   │   ├── users.json           # Users data
│   │   ├── posts.json           # Posts data
│   │   ├── messages.json        # Messages data
│   │   └── appointments.json    # Appointments data
│   └── uploads/                 # Image uploads folder
│
├── src/
│   ├── pages/
│   │   ├── Index.tsx            # Home page (posts feed for consumers)
│   │   ├── Login.tsx            # Authentication page
│   │   ├── Post.tsx             # Operator post creation page
│   │   ├── Messages.tsx         # Messaging interface
│   │   ├── Workers.tsx          # Service booking page
│   │   └── Profile.tsx          # User profile page
│   ├── components/
│   │   ├── AppNavigation.tsx    # Navigation (role-based)
│   │   ├── AppLayout.tsx        # Main layout wrapper
│   │   └── ui/                  # Shadcn UI components
│   ├── lib/
│   │   ├── api.ts               # API service functions
│   │   └── utils.ts             # Utility functions
│   └── App.tsx                  # Main app component
```

---

## Key Implementation Details

### 1. User Type Based Navigation
Navigation dynamically changes based on user role:
- **Operator**: Home → Posts → Messages → Profile
- **Consumer**: Home → Workers → Messages → Profile
- **Not Logged In**: Home → Login

### 2. Session Storage
User data is stored in browser's sessionStorage:
```javascript
sessionStorage.setItem("userId", user.id);
sessionStorage.setItem("userEmail", user.email);
sessionStorage.setItem("userName", user.name);
sessionStorage.setItem("userRole", user.role);
sessionStorage.setItem("userPhone", user.phone);
```

### 3. Image Handling
- Posts require before/after images (uploaded to backend/uploads)
- Images served via static route: `/uploads/[filename]`
- File format: Any image type (jpg, png, etc.)

### 4. Message Types
- **Regular Messages**: Text-based communication
- **Appointment Requests**: Special message format with appointment details

---

## Testing the System

### Step 1: Login as Operator
1. Go to Login page
2. Email: `asifkazi369@gmail.com`
3. Password: `CONSCIENTIOUS`
4. You're now the operator

### Step 2: Create a Post
1. Click "Post" in navigation
2. Fill in details:
   - Type of Work: "Plumbing Repair"
   - Before Photo: (select any image)
   - After Photo: (select any image)
   - Hours: 4
   - Rating: 4.5
3. Click "Upload Post"

### Step 3: Register as Consumer
1. Click "Login" → "Don't have an account? Sign up"
2. Create new account with:
   - Name: Test User
   - Email: test@example.com
   - Password: Test@123
3. You're now a consumer

### Step 4: Browse and Book Service
1. Home page shows the post you created
2. Click "Book Now"
3. Fill appointment details:
   - Date: Pick a future date
   - Location: Your current address
   - Working Hours: 9 AM - 1 PM
4. Click "Confirm Booking"

### Step 5: Operator Views Message
1. Logout and login as operator again
2. Click "Messages"
3. See consumer's appointment request with all details
4. Click on consumer name to view full conversation

---

## Troubleshooting

### Backend not starting
- Check if port 3001 is already in use
- Make sure all dependencies are installed: `npm install`
- Run `npm run dev` from backend folder

### Frontend can't connect to backend
- Ensure backend is running on http://localhost:3001
- Check CORS is enabled (it is in server.js)
- Check browser console for error messages

### Images not uploading
- Make sure /backend/uploads folder exists
- Check file size isn't too large (50MB limit)
- Verify image file format is supported

### Messages not appearing
- Refresh the page
- Check that you're logged in
- Ensure operator ID matches (should be "operator-1")

---

## Future Enhancements
- [ ] Real-time messaging with WebSockets
- [ ] Email notifications
- [ ] Payment integration
- [ ] Review/rating system for consumers
- [ ] Appointment status tracking (pending/confirmed/completed)
- [ ] Real distance/geolocation based matching
- [ ] Profile picture uploads
- [ ] Search and filter posts
- [ ] Multi-operator support
- [ ] Scheduled appointments calendar

---

## Support
For any issues or questions, check:
1. Browser console for error messages (F12)
2. Backend terminal output for server logs
3. Network tab in DevTools to see API responses

---

**Created**: February 7, 2026
**Version**: 1.0 - Complete Implementation
