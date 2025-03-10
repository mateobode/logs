# Log Management System

A web-based application that allows users to manage logs built with Django backend and React frontend.

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker Desktop
- Docker Compose

## Local Development with Docker

1. Clone the repository:
```bash
git clone https://github.com/mateobode/logs.git
cd logs
```

3. Build and start the containers in detached mode:
```bash
docker compose up --build -d
```

This will start all services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

4. After the container services are running, inside the backend service terminal execute these two commands:
```bash
python manage.py migrate
python manage.py makemigrations
```

5. To populate the database with logs instances, inside backend serivce terminal execute script:
```bash
python populate_db.py
```

To stop the containers:
```bash
docker compose stop
```

To remove the containers:
```bash
docker compose down
```

## Project Structure

The project consists of several services:

### Backend (Django)
- Location: `/backend`
- Running on port 8000
- Connected to PostgreSQL database

### Frontend (React)
- Location: `/frontend`
- Running on port 3000
- Built with:
  - React 19.0.0
  - React Router DOM 7.2.0
  - Bootstrap 5.3.3
  - Axios 1.8.1
  - React Bootstrap 2.10.9
  - React DatePicker 8.1.0
  - Recharts 2.15.1

### Database (PostgreSQL)
- Version: 16-alpine
- Data persisted in Docker volume: `postgres_data`
- Running on port 5432

### Cache (Redis)
- Version: 7.2-alpine
- Data persisted in Docker volume: `redis_data`
- Running on port 6379

## Manual Setup (Alternative to Docker)

If you prefer to run the services without Docker:

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- On macOS/Linux:
```bash
source venv/bin/activate
```
- On Windows:
```bash
.\venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install requirements.txt
```

4. Configure your PostgreSQL database connection in settings.py

5. Run migrations:
```bash
python manage.py migrate
python manage.py makemigrations
```

6. Start the Django development server:
```bash
python manage.py runserver
```
7. If you want to populate the database with more logs, run this script:
```bash
python populate_db.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

## Available Scripts

In the backend directory:
- `python manage.py runserver` - Runs the Django development server
- `python manage.py migrate` - Run database migrations
- `python manage.py createsuperuser` - Create a Django admin user

In the frontend directory:
- `npm start` - Runs the React development server
- `npm build` - Builds the app for production

## [ATTENTION] Backend server and Frontend server must be running at the same time for the application to work!

## Docker Commands

Useful Docker commands for development:

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs

# View logs for a specific service
docker-compose logs <service-name>

# Rebuild a specific service
docker-compose up -d --build <service-name>

# Stop and remove all containers including volumes
docker-compose down -v
```
