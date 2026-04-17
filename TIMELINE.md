# Partner App (Mobile) - Sprint Timeline

## Project Overview

**Project:** M Eaton Trucking LLC - Driver Partner Mobile App (React Native)
**Team:** 4 members (Mobile Dev, QA Dev, Backend Dev, Team Lead)
**Start Date:** January 26, 2025
**Code Freeze:** April 21, 2025
**Duration:** 12 weeks (6 sprints)

---

## Sprint Overview

| Sprint | Dates | Focus Area | Key Deliverable |
|--------|-------|------------|-----------------|
| Sprint 1 | Jan 26 - Feb 8 | Requirements & Design | System Design Document |
| Sprint 2 | Feb 9 - Feb 22 | Project Setup & Auth | Working Authentication |
| Sprint 3 | Feb 23 - Mar 8 | Job Views & Push Setup | Job List & Detail Screens |
| Sprint 4 | Mar 9 - Mar 22 | Notifications & Sync | Real-time Notifications & Offline Caching |
| Sprint 5 | Mar 23 - Apr 5 | Sync Layer & Testing | API Extensions & QA Testing |
| Sprint 6 | Apr 6 - Apr 19 | Final Testing & Deployment | Test Builds Distributed |

---

## Sprint 1: Requirements & Design
**Dates:** Jan 26 - Feb 8, 2025

### Sprint Goal
Complete system design and architecture planning with approved mockups and technical specifications.

### Key Activities
- Review existing backend API and infrastructure
- Define driver user stories and workflows
- Create wireframes/mockups for all screens
- Design system architecture and data flow
- Identify API gaps and required extensions
- Research push notification services (FCM/APNs)
- Define testing strategy

### Deliverable
**Requirements Specification & System Design Document** - Including user roles, workflows, mockups, and technical architecture

### Exit Criteria
- System design document approved by team
- All wireframes/mockups completed
- API requirements documented
- Testing strategy defined

---

## Sprint 2: Project Setup & Authentication
**Dates:** Feb 9 - Feb 22, 2025

### Sprint Goal
Bootstrap React Native project and implement driver authentication using existing JWT backend.

### Key Activities
- Initialize React Native project (Expo or bare workflow)
- Set up CI/CD pipeline for mobile builds
- Configure CORS and mobile-specific auth settings in Django
- Build login screen with JWT integration
- Implement secure token storage
- Build password reset flow
- Add role-based route guards for Driver role
- Write unit tests for auth components

### Deliverable
**Driver Authentication & Role-Based Access** - Fully functional authentication system

### Exit Criteria
- Drivers can log in and view profile
- Password reset working via existing OTP/SMTP2GO
- Token storage secure
- Unit tests passing

---

## Sprint 3: Job Views & Push Infrastructure
**Dates:** Feb 23 - Mar 8, 2025

### Sprint Goal
Build core job viewing functionality and set up push notification infrastructure.

### Key Activities
- Build "My Jobs" list screen (consume `/api/job-driver-assignments/`)
- Build job detail screen (job info, customer, location, materials)
- Implement daily schedule view
- Integrate map view for job locations
- Add driver-specific filtering to backend endpoints
- Set up push notification infrastructure (FCM + APNs)
- Build notification backend service
- Write integration tests for job endpoints

### Deliverable
**Job Views & Push Foundation** - Drivers can view assigned jobs with push infrastructure ready

### Exit Criteria
- Job list and detail screens functional
- Map view integrated
- Push notification infrastructure configured
- Integration tests passing

---

## Sprint 4: Notifications & Offline Sync
**Dates:** Mar 9 - Mar 22, 2025

### Sprint Goal
Complete notification system and implement offline data caching.

### Key Activities
- Build "Report Issue" screen and endpoint
- Implement job status updates (arrived, in-progress, complete)
- Handle push notification display and in-app notifications
- Test notification delivery across Android and iOS
- Implement offline data caching (job assignments, schedule)
- Build sync mechanism (queue offline actions)
- Add mobile-specific API endpoints

### Deliverable
**Real-time Notifications & Offline Support** - Full notification system with offline capability

### Exit Criteria
- Drivers receive push notifications for job updates
- Drivers can report issues
- Job status updates working
- Offline caching functional

---

## Sprint 5: Sync Layer & Testing
**Dates:** Mar 23 - Apr 5, 2025

### Sprint Goal
Complete sync layer with conflict resolution and begin comprehensive testing.

### Key Activities
- Implement conflict resolution for sync layer
- Add API versioning and mobile client identification
- Optimize API responses for mobile
- Write API documentation for new endpoints
- Complete unit test coverage for mobile components
- Run integration tests (mobile ↔ backend full flow)
- Conduct usability testing with sample drivers
- Fix critical bugs from testing

### Deliverable
**API Extensions & Sync Layer + Initial QA** - Complete offline-to-online sync with testing begun

### Exit Criteria
- Full offline → online sync cycle working
- Conflict resolution tested
- Usability testing completed
- Critical bugs fixed

---

## Sprint 6: Final Testing & Deployment
**Dates:** Apr 6 - Apr 19, 2025

### Sprint Goal
Complete all testing, fix remaining bugs, and distribute test builds.

### Key Activities
- Performance testing (load times, battery, data usage)
- Security review (token handling, data encryption, API security)
- Write QA report documenting all test results
- Fix remaining bugs from QA findings
- Configure production build settings (Android + iOS)
- Build and distribute Android APK/AAB test version
- Build and distribute iOS test version (TestFlight)
- Write deployment documentation and handoff notes
- Final smoke testing on distributed builds

### Deliverable
**Testing Plan & QA Report + Deployed Test Builds** - Production-ready mobile app

### Exit Criteria
- All tests passing
- QA report completed
- Android and iOS test builds distributed
- Deployment documentation complete

**CODE FREEZE: April 21, 2025**

---

## Key Dependencies & Existing Infrastructure

The previous team built a Django REST backend that we will integrate with:

- JWT Authentication (`djangorestframework-simplejwt`) with token refresh
- `/api/jobs/` and `/api/job-driver-assignments/` endpoints ready
- Role-based access control (Admin, Manager, Driver roles)
- PostgreSQL on Supabase (shared database)
- OTP password reset via SMTP2GO
- Docker Compose dev environment

---

## Risk Management

| Risk | Mitigation Strategy |
|------|-------------------|
| Backend API gaps for driver-specific queries | Audit API in Sprint 1, plan extensions early |
| Push notification setup complexity | Start infrastructure in Sprint 3 alongside UI work |
| iOS build requires Apple Developer account | Confirm access by Sprint 2 |
| Offline sync conflicts with web platform | Design conflict resolution in Sprint 1 |
| Team availability/scheduling conflicts | Cross-train team members, document decisions |

---

## Team Responsibilities

| Area | Primary Owner | Support |
|------|--------------|---------|
| React Native UI/UX | Mobile Dev | Team Lead |
| Django API Extensions | Backend Dev | Mobile Dev |
| Push Notifications | Backend Dev | Mobile Dev |
| Testing & CI/CD | QA Dev | All |
| Project Management | Team Lead | All |
| Deployment & Builds | Mobile Dev | QA Dev |
