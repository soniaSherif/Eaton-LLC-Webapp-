# Eaton-LLC-Webapp-First Semester

# 🚚 M Eaton Trucking Web Application

This full-stack web application was developed for **M Eaton Trucking LLC** to streamline the workflow for job creation, driver and truck assignment, and daily operations. The application serves as a digital foundation to eventually support dispatch management, financial reporting, and full trucking project lifecycle operations.

---

## 📌 Project Overview

This project provides dispatchers and managers with an intuitive dashboard to:

- Create jobs
- Manage truck and driver information
- Assign drivers and trucks to jobs
- Visualize jobs by date on a Daily Board

---

## 🛠️ Tech Stack

**Frontend:**
- Angular
- HTML, SCSS, TypeScript

**Backend:**
- Django
- Python

**Database:**
- PostgreSQL (hosted via Docker)
- Managed via pgAdmin

**Hosting & Deployment:**
- Docker
- AWS (future scope for cloud hosting)

**Development Tools:**
- GitHub
- Postman

---

## 🚀 Features

- ✅ Job creation with form-based input
- ✅ Driver and truck registration and management
- ✅ Job-to-driver/truck assignment
- ✅ Daily board view to monitor scheduled jobs
- ✅ Role-based team member responsibilities (MTO, ITO, Dispatcher)
- 🔒 Secure login system (Django-auth with hashed passwords)
- 📊 Database built with Django ORM and fully normalized for scalability

---

## ⚙️ Local Setup Instructions

### Option 1: Manual

**Frontend (Angular)**
```bash
npm install -g @angular/cli
git clone https://github.com/JacobFriedges/Eaton-LLC-Webapp-
cd frontend
npm install --legacy-peer-deps
ng serve
```

**Backend (Django)**
```bash
git clone https://github.com/JacobFriedges/Eaton-LLC-Webapp-
cd backend
python -m venv venv
# Activate environment:
venv\Scripts\activate    # Windows  
source venv/bin/activate # Mac/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```


### Option 2: Docker
To run both frontend and backend together:
```bash
docker-compose up --build
```

---

## ✅ Completed Deliverables

- [x] System design specification
- [x] Cloud-hosted PostgreSQL database via Docker
- [x] Web application with CRUD functionality
- [x] Fleet & assignment management
- [x] Handover documentation
- [x] Manual testing strategy implemented

---

## 🧪 Testing Strategy

We implemented manual testing using Postman and browser tools. Future teams are encouraged to implement:
- `pytest`-based unit and integration tests
- Cypress or Playwright for E2E UI testing
- Full test coverage for CRUD endpoints and auth

---

## 📁 Project Structure

```bash
├── frontend/                 # Angular app
│   ├── app/pages/           # Components for dispatch, fleet, daily board
│   ├── app/services/        # API service handlers
│   └── app-routing.module.ts# Route mapping
│
├── backend/                 # Django API backend
│   ├── models.py            # Job, Driver, Truck, Assignment schemas
│   ├── views.py             # Business logic and CRUD handling
│   ├── serializers.py       # JSON format handling
│   └── Dockerfile           # Docker container setup
│
└── docker-compose.yml       # Container orchestration
```

---

## 📈 Future Scope

- Financial and performance reports
- Invoicing and billing system
- Role-based access control
- Automated testing suite
- Multi-user support with login roles
- Cloud-based deployment (e.g., AWS ECS or Heroku)


