# Eaton-LLC-Webapp-Second Semester

# 🚚 M Eaton Trucking Web Application

This full-stack web application was developed for **M Eaton Trucking LLC** to streamline daily trucking operations, including job creation, dispatching, fleet management, customer billing, and driver payroll. The system provides a digital foundation for managing the full lifecycle of construction hauling projects—from job scheduling to invoicing and pay reports.

---

## 📌 Project Overview

This project provides dispatchers and managers with an intuitive dashboard to:

* Create and manage jobs
* Track projects and customer information
* Manage driver and truck fleets
* Dispatch drivers and trucks using a structured assignment workflow
* View daily job operations on the Daily Board
* Generate weekly invoices and driver pay reports

The platform is designed to improve accuracy, reduce manual paperwork, and centralize business operations for scalability.

---

## 🛠️ Tech Stack

**Frontend:**

* Angular
* HTML, SCSS, TypeScript

**Backend:**

* Django + Django REST Framework
* Python

**Database:**

* PostgreSQL (Supabase-hosted)
* Managed via pgAdmin

**Hosting & Deployment:**

* Docker containers for backend
* Netlify for frontend builds
* AWS/Heroku considered for long-term deployment

**Development Tools:**

* GitHub
* Postman
* Docker Compose

---

## 🚀 Features (Updated for Phase 2)

### 🔧 Operations & Dispatching

* **Job creation** with customer, project, material, schedule, and load details
* **Dispatch assignments** with job, driver, truck, weight/rate and time selection
* **Daily Board** view to visualize all scheduled jobs for a given day with Google Maps static images 
* **All Jobs page** for searching, filtering, and reviewing job records

### 👥 Customers & Projects

* **Customer List** management with name, contact details, and project association
* **Project & job tracking** with schedule, material, and contract metadata
* Linked workflows ensure jobs map correctly to customers and invoicing
* 
### 👥 Drivers
* **Drivers** records updated with important expiry dates

### 🔐 Authentication

* **Secure login system** with role-based permissions (Admin, Manager, Driver)
* **Password reset via SMTP2GO OTP** for secure account recovery
* Django REST authentication with session and token handling

### 💵 Financial Reporting

* **Weekly Invoices** for customers based on completed jobs

  * Includes job date, material, driver/truck info, and billable totals
* **Driver Pay Reports**

  * Automatically aggregates job activity, pay rates, fuel adjustments, and total wage calculations
  * Detailed pay lines for each job completed


## ⚙️ Local Setup Instructions

### Option 1: Manual

#### **Frontend (Angular)**

```bash
npm install -g @angular/cli
git clone https://github.com/JacobFriedges/Eaton-LLC-Webapp-
cd frontend
npm install --legacy-peer-deps
ng serve
```

#### **Backend (Django)**

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

## ✅ Completed Deliverables (Phase 2)

* [x] Updated system architecture & RAD document
* [x] Role-based login system with OTP password reset
* [x] Customer, fleet, and project management modules
* [x] Job creation, dispatching, and daily operations workflow
* [x] Weekly invoice generation for customers
* [x] Driver pay report generation with automatic line-item calculations
* [x] Enhanced UI/UX for All Jobs, Dispatch, and Customer pages
* [x] Cloud-ready Dockerized backend
* [x] Handover documentation & schema diagrams

---

## 🧪 Testing Strategy

The team executed functional and integration testing:

* Backend validation via Postman (CRUD, auth, invoice, pay reports)
* Frontend manual testing for forms, tables, dispatch logic, and job creation
* Authentication & OTP flows tested using SMTP2GO sandbox
* Recommended future tests:

  * Automated unit tests using `pytest`
  * Angular E2E tests via Cypress or Playwright
  * Load testing for reports and invoice generation

---

## 📁 Project Structure

```bash
├── frontend/                 
│   ├── app/pages/            # Job, Dispatch, Customers, Reports
│   ├── app/services/         # API service handlers
│   └── app-routing.module.ts
│
├── backend/
│   ├── models.py             # Jobs, Drivers, Trucks, Invoices, Pay Reports
│   ├── views.py              # Business logic & API endpoints
│   ├── serializers.py        # Data formatting
│   ├── urls.py               # Routing
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 📈 Future Scope

* Partner App for drivers (mobile)
* Real-time truck tracking + DOT compliance
* Advanced analytics dashboards
* Multi-company SaaS onboarding
* Full AWS/Heroku deployment pipeline
* Automated testing suite and CI/CD integration

