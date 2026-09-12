# LibraryOS

LibraryOS is a full-stack library management system with role-based access for admins and students.

## Live deployment (100% free)

This project can be deployed fully free using:

- MongoDB Atlas (Free M0) for database
- Render (Free Web Service) for backend API
- Netlify (Free Site) for frontend

Follow this exact order: Atlas -> Render -> Netlify -> Render CORS update.

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Node.js
- Express
- MongoDB

## Run locally

1. Install frontend dependencies:

```sh
npm install
```

2. Install backend dependencies:

```sh
cd backend
npm install
```

3. Configure backend environment variables in `backend/.env`.

4. Start backend server:

```sh
cd backend
npm run dev
```

5. Start frontend app:

```sh
npm run dev
```

## Backend environment variables

Create `backend/.env` with:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<long_random_secret>
PORT=5000
FRONTEND_URL=http://localhost:8080
```

`FRONTEND_URL` may contain multiple comma-separated browser origins, for example:

```env
FRONTEND_URL=http://localhost:8080,https://your-site.netlify.app
```

Public sign-up always creates a student account. Create administrator accounts through the authenticated admin Users page.

For production on Render, set these in Render Environment settings (do not commit secrets).

## Free deployment guide (step by step)

### 1) Push code to GitHub

1. Commit your latest changes.
2. Push your repository to GitHub.

### 2) Create MongoDB Atlas free database

1. Create a free M0 cluster.
2. Create a database user.
3. In Network Access, allow your deployment providers (or use `0.0.0.0/0` for quick setup).
4. Copy your MongoDB connection string for `MONGO_URI`.

### 3) Deploy backend to Render (free)

1. Create a new Web Service from your GitHub repo.
2. Use these settings:
	- Root Directory: `backend`
	- Build Command: `npm install`
	- Start Command: `npm start`
3. Add environment variables:
	- `MONGO_URI` = Atlas connection string
	- `JWT_SECRET` = secure random secret
	- `NODE_ENV` = `production`
	- `FRONTEND_URL` = Netlify URL (set after frontend deploy, then redeploy backend)
4. Deploy and copy your backend URL (example: `https://libraryos-api.onrender.com`).

### 4) Deploy frontend to Netlify (free)

1. Create a new site from your GitHub repo.
2. Build settings:
	- Base directory: repository root
	- Build command: `npm run build`
	- Publish directory: `dist`
3. Add environment variable:
	- `VITE_API_URL` = your Render backend URL
4. Deploy and copy your frontend URL (example: `https://libraryos.netlify.app`).

### 5) Final CORS update

1. Go back to Render backend environment variables.
2. Set `FRONTEND_URL` to your deployed Netlify URL.
3. Redeploy backend.

### 6) Production smoke check

Validate these on the deployed app:

1. Login works for admin and student.
2. Books list loads.
3. Student can borrow and return books.
4. Student sees only their own issues and fines.
5. Reports page loads.

## Optional local smoke checks before deploy

Run all checks in one command:

```sh
node test-permissions.js
node test-user-isolation.js
node test-student.js
node test-admin.js
cd backend
node test-overdue.js
```

## Test scripts

- `node test-permissions.js`
- `node test-student.js`
- `node test-admin.js`
- `node test-user-isolation.js`

## Notes

- The frontend runs on `http://localhost:8080`.
- The backend runs on `http://localhost:5000` by default.
