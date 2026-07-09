# PriorityFlow Production Deployment Guide

This guide describes how to deploy the PriorityFlow MERN application to production using **MongoDB Atlas**, **Render**, and **Vercel**.

---

## 1. Database Setup: MongoDB Atlas

1. **Create an Account / Log In:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. **Create a Cluster:** Choose the free tier shared cluster and select your preferred region.
3. **Database User:** 
   - Navigate to **Security > Database Access**.
   - Click **Add New Database User**.
   - Set authentication method to **Password**, create a username and password, and assign the role **Read and write to any database**.
4. **Network Access:**
   - Navigate to **Security > Network Access**.
   - Click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) or whitelist Render's outbound IPs.
5. **Get Connection String:**
   - Go to your Cluster **Database** dashboard and click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like this:
     ```
     mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/<database-name>?retryWrites=true&w=majority
     ```
   - Replace `<username>`, `<password>`, and `<database-name>` with your credentials.

---

## 2. Backend Deployment: Render

1. **Prepare Code:** Push your updated code containing the production configuration to your GitHub repository.
2. **Create Web Service:**
   - Go to [Render](https://render.com/) and click **New > Web Service**.
   - Connect your GitHub repository.
3. **Configure Service Details:**
   - **Name:** `priorityflow-backend` (or similar)
   - **Region:** Choose a region close to your database/users.
   - **Root Directory:** `todo-calendar-app/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables:**
   Add the following variables in the **Environment** tab:
   - `MONGODB_URI` = `mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/<database-name>?retryWrites=true&w=majority`
   - `CORS_ORIGIN` = `https://your-frontend-app.vercel.app` (This will be your Vercel deployment URL)
   - `PORT` = `5000` (Render sets its own `PORT` variable automatically, but defining this acts as a default/reference)
5. **Deploy:** Render will automatically deploy your backend. Copy the generated `.onrender.com` URL (e.g. `https://priorityflow-backend.onrender.com`).

---

## 3. Frontend Deployment: Vercel

1. **Log In to Vercel:** Go to [Vercel](https://vercel.com/) and link your GitHub account.
2. **Import Project:**
   - Click **Add New > Project** and select your repository.
3. **Configure Project Details:**
   - **Framework Preset:** Vite (Vercel automatically detects this).
   - **Root Directory:** `frontend` (Click Edit and select the `frontend` folder).
4. **Environment Variables:**
   Add the following variable under **Environment Variables**:
   - `VITE_API_URL` = `https://your-backend-app.onrender.com` (Your Render backend URL without a trailing slash)
5. **Deploy:** Click **Deploy**. Vercel will build the frontend client and generate a production URL (e.g. `https://your-frontend-app.vercel.app`).

---

## Post-Deployment Validation Checklist

- [ ] Verify that your Vercel URL is added as `CORS_ORIGIN` in Render's environment settings.
- [ ] Open the Vercel app in your browser and check the network tab to verify successful API payloads to the Render service.
- [ ] Confirm database updates in MongoDB Atlas Browse Collections to ensure write privileges are functioning properly.
