# PriorityFlow – Full-Stack Task & Productivity Hub

PriorityFlow is a modern, responsive task management application built on the MERN stack. It incorporates an interactive Dashboard, a customizable Kanban Board, an advanced List view with multi-criteria sorting/filtering, and a custom monthly Calendar view.

## Project Structure

```
├── frontend/                  # React + Vite client-side code
│   ├── src/                   # React components, styles, and API utilities
│   ├── vercel.json            # Vercel client-side routing config
│   └── .env.example           # Frontend environment template
│
└── todo-calendar-app/
    └── backend/               # Express.js + Mongoose server
        ├── models/            # MongoDB Schemas (Mongoose)
        ├── routes/            # REST API endpoints
        ├── server.js          # Server entry point
        └── .env.example       # Backend environment template
```

## Local Development Quickstart

To run the application locally:

1. Ensure you have **Node.js** and **MongoDB** installed and running on your local machine.
2. Clone this repository.
3. Configure the `.env` files in both `frontend` and `todo-calendar-app/backend` by copying the respective `.env.example` templates.
4. Run the launcher script:
   ```cmd
   run.bat
   ```
   This will automatically:
   - Install/run the backend server at `http://localhost:5000`
   - Start the Vite development frontend client at `http://localhost:5173`
   - Launch your default browser to view the application.

## Production Deployment

This application is ready for production deployment:
- **Database:** Deploy via MongoDB Atlas.
- **Backend:** Deploy via Render (Root: `todo-calendar-app/backend`).
- **Frontend:** Deploy via Vercel (Root: `frontend`).

Detailed step-by-step instructions are available in the [DEPLOYMENT.md](DEPLOYMENT.md) file.
