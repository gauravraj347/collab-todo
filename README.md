# Real-Time Collaborative To-Do Board

A full-stack web application that enables multiple users to collaborate on tasks in real-time, similar to a minimal Trello board with live synchronization and custom business logic.

## 🎯 Project Overview

This application allows teams to manage tasks collaboratively with real-time updates, smart task assignment, and conflict resolution. Users can create, edit, delete, and reassign tasks while seeing changes happen instantly across all connected clients.

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework with MVC architecture
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend

- **React** - UI library
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Custom CSS** - No third-party frameworks
- **HTML5 Drag & Drop API** - Task movement

## 🚀 Features

### Core Functionality

- ✅ **User Authentication** - Secure registration and login with JWT
- ✅ **Real-Time Collaboration** - Live updates across all users
- ✅ **Kanban Board** - Three columns: Todo, In Progress, Done
- ✅ **Drag & Drop** - Move tasks between columns
- ✅ **Task Management** - Create, edit, delete tasks
- ✅ **User Assignment** - Assign tasks to any user
- ✅ **Activity Logging** - Track all actions with timestamps

### Advanced Features

- ✅ **Smart Assign** - Automatically assign to user with fewest active tasks
- ✅ **Conflict Resolution** - Handle simultaneous edits with merge/overwrite options
- ✅ **Task Validation** - Unique titles, no column name conflicts
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Custom Animations** - Smooth card transitions

## 📋 Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd todotest
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the backend directory:

   ```env
   MONGO_URI=mongodb://localhost:27017/collab_todo
   JWT_SECRET=xxxxxxxyyyyyyyyyyyzzzzzzzzzzzz
   PORT=4000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:4000`

### Frontend Setup

1. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

### Demo Data Setup

1. **Run the seed script** (optional)

   ```bash
   cd backend
   node seed.js
   ```

## 🎮 Usage Guide

### Getting Started

1. Register a new account
2. Create tasks using the form at the top
3. Drag and drop tasks between columns
4. Click "Edit" to modify task details
5. Use "Smart Assign" to automatically assign tasks
6. View activity log to see recent actions

### Real-Time Features

- Open multiple browser tabs to test real-time collaboration
- Make changes in one tab and see them instantly in others
- Activity log updates in real-time

### Conflict Resolution

- When two users edit the same task simultaneously
- Choose "Use Server Version" or "Keep My Version"
- System prevents data loss and maintains consistency

## 🔧 Smart Assign Logic

The Smart Assign feature automatically assigns tasks to the user with the fewest active (non-completed) tasks. Here's how it works:

1. **Count Active Tasks**: The system counts all tasks assigned to each user that are not in "Done" status
2. **Find Minimum**: Identifies the user with the lowest task count
3. **Assign Task**: Automatically assigns the task to that user
4. **Update Log**: Records the smart assignment in the activity log

This ensures fair workload distribution across team members and prevents any single user from being overwhelmed.

## ⚡ Conflict Handling Logic

When multiple users edit the same task simultaneously, the system detects conflicts using version control:

1. **Version Tracking**: Each task has a version number that increments with each edit
2. **Conflict Detection**: When a user tries to save, the system compares their version with the server version
3. **Conflict Resolution**: If versions don't match, the system shows both versions to the user
4. **User Choice**: Users can choose to:
   - Use Server Version (overwrites their changes)
   - Keep My Version (overwrites server changes)
   - Cancel the operation

This prevents data loss and ensures all users are aware of conflicts.

## 🌐 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Create account** on your preferred platform
2. **Connect your GitHub repository**
3. **Set environment variables**:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
   - `PORT` - Usually set automatically
4. **Deploy** - The platform will build and deploy your Node.js app

### Frontend Deployment (Vercel/Netlify)

1. **Create account** on Vercel or Netlify
2. **Connect your GitHub repository**
3. **Set build settings**:
   - Build command: `npm run build`
   - Output directory: `build`
4. **Set environment variables**:
   - `REACT_APP_API_URL` - Your backend URL
5. **Deploy** - Your React app will be live

### Environment Variables for Production

**Backend (.env)**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/collab_todo
JWT_SECRET=xxxxxxxxxxxxyyyyyyyyyyyyyyzzzzzzzzzzzzzz
PORT=4000
```

**Frontend (.env)**

```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 📱 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/smart-assign` - Smart assign task

### Actions

- `GET /api/actions` - Get last 20 actions

### Users

- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user

## 🎥 Demo Video

[Link to your demo video will be added here]

## 📄 Logic Document

[Link to Logic_Document.md will be added here]

## 🔗 Live Demo

[Link to your deployed app will be added here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- MongoDB for database
- React team for the amazing framework
- Express.js for the backend framework
