# Role Manager Hub

A comprehensive full-stack application for managing roles, users, projects, tasks, and analytics with role-based access control.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Building for Production](#building-for-production)
- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Available Scripts](#available-scripts)
- [License](#license)

## Overview

Role Manager Hub is a modern, full-stack web application built with Express, React, and TypeScript. It provides a complete solution for managing organizational roles, users, projects, and tasks with an intuitive dashboard, real-time analytics, and role-based access control.

## Features

- **User Management**: Create, update, and manage user accounts with role-based access
- **Project Management**: Organize and track projects with detailed information
- **Task Management**: Create, assign, and track tasks within projects
- **Analytics Dashboard**: Real-time analytics with interactive charts and metrics
- **Role-Based Access Control (RBAC)**: Different permission levels for users
- **Authentication**: Secure user authentication with session management
- **Responsive UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Real-time Updates**: WebSocket support for live updates
- **Database Integration**: MongoDB for persistent data storage

## Project Structure

```
Role-Manager-Hub/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and libraries
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # React entry point
│   ├── public/            # Static assets
│   └── index.html         # HTML template
├── server/                 # Express backend application
│   ├── controllers/       # Request handlers
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   ├── auth.ts            # Authentication setup
│   ├── db.ts              # Database connection
│   ├── static.ts          # Static file serving
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and utilities
│   ├── routes.ts          # Route definitions
│   └── schema.ts          # Data schemas
├── script/                 # Build and utility scripts
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── drizzle.config.ts      # Database migration config
```

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (local or cloud instance via MongoDB Atlas)
- **Git**

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Role-Manager-Hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/role-manager-hub
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/role-manager-hub

# Server Configuration
NODE_ENV=development
PORT=5173

# Session Configuration
SESSION_SECRET=your-secret-key-here

# Frontend Configuration
VITE_API_URL=http://localhost:5173
```

## Running the Project

### Development Mode

Start the development server with hot module reloading:

```bash
npm run dev
```

This command will:

- Start the Express server on `http://localhost:5173`
- Start the Vite development server for the React frontend
- Enable hot module replacement for both frontend and backend
- Seed the database with initial data

The application will be accessible at `http://localhost:5173`

### Type Checking

Verify TypeScript types without building:

```bash
npm run check
```

## Building for Production

### Build the Project

```bash
npm run build
```

This command will:

- Build the React frontend for production
- Bundle and minify the Express server
- Create optimized output in the `dist/` directory

### Start Production Server

```bash
npm start
```

This will run the compiled production build.

## Project Architecture

### Frontend Architecture

- **React 18**: Modern React with hooks
- **React Query**: Data fetching and caching
- **Wouter**: Lightweight routing
- **Hook Form**: Form state management
- **Zod**: Schema validation
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component library

### Backend Architecture

- **Express**: Web framework
- **Mongoose**: MongoDB object modeling
- **Passport**: Authentication middleware
- **Express Session**: Session management
- **WebSockets**: Real-time communication

### Database

- **MongoDB**: NoSQL database
- **Mongoose**: ODM (Object Document Mapper)

## Tech Stack

### Frontend

- React 18.3
- TypeScript 5.6
- Vite 7.3
- Tailwind CSS 3.4
- Radix UI Components
- React Query 5.60
- Framer Motion (animations)
- Lucide React (icons)
- Recharts (analytics charts)

### Backend

- Express 5.0
- TypeScript 5.6
- Mongoose 8.21
- Passport (authentication)
- MongoDB (database)
- WebSockets (real-time updates)

### Development Tools

- TSX (TypeScript executor)
- ESBuild (bundler)
- Vite (frontend build tool)
- PostCSS (CSS processing)

## API Documentation

### Authentication Routes

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### User Routes

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Project Routes

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Task Routes

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Analytics Routes

- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/projects` - Get project analytics
- `GET /api/analytics/tasks` - Get task analytics

### Dashboard Routes

- `GET /api/dashboard` - Get dashboard data

## Available Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Build project for production             |
| `npm start`     | Start production server                  |
| `npm run check` | Run TypeScript type checking             |

## Directory Descriptions

### `/client`

Contains the React frontend application with all UI components, pages, hooks, and styling.

### `/server`

Contains the Express backend with controllers, routes, services, middleware, and database setup.

### `/shared`

Contains TypeScript interfaces, types, and schemas shared between frontend and backend.

### `/script`

Contains utility scripts for building and project setup.

## Common Issues and Solutions

### Port Already in Use

If port 5173 is already in use, modify the Vite config or kill the process:

```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### MongoDB Connection Error

- Ensure MongoDB is running locally or check your MongoDB Atlas connection string
- Verify `MONGODB_URI` in `.env` file
- Check network connectivity for cloud MongoDB

### Dependencies Installation Issues

Try clearing the cache and reinstalling:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing

When contributing to this project:

1. Create a new branch for your feature
2. Follow the existing code style
3. Write TypeScript with proper type annotations
4. Test your changes before submitting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: January 2026
