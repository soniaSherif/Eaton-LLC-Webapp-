# M5 Final QA Report 

## Overview

For the M5 milestone, I conducted comprehensive QA testing of the system covering both the mobile application and backend services. The goal of this testing was to validate the core functionality of the app, including authentication, job management, status updates, offline behavior, synchronization, push notifications, and backend API reliability.

This QA process included three main components:

- Manual testing on a physical Android device  
- Automated frontend testing using Jest  
- Backend test debugging, stabilization, and execution using pytest  

I followed a structured step-by-step testing approach, covering both normal usage (happy path) and edge cases such as network failures and offline scenarios. In addition to manual testing, previously identified issues from frontend and backend code analysis (using Copilot) were reviewed and validated against real device behavior.

---

## Testing Environment

Platform: Android  
Device: Physical Android device  
Testing Duration: Approximately 4–6 hours (manual testing)  
Testing Type: Manual + Automated testing  
Scope: Frontend behavior with backend interaction + backend API validation  

Backend Environment:
- Django + Django REST Framework  
- pytest used for backend test execution  

Frontend Environment:
- React Native (Expo)  
- Jest used for frontend automated testing  

---

## Testing Approach

I tested the application sequentially, starting from authentication and moving through all major features. The process included:

- Verifying expected functionality under normal conditions  
- Intentionally breaking flows (invalid input, repeated actions, etc.)  
- Testing under no network conditions (Airplane Mode)  
- Testing offline-to-online sync behavior  
- Validating push notification delivery and interaction  
- Comparing UI behavior with expected backend-driven results  

In addition to manual testing, I also validated system reliability through automated test execution:

- Frontend test suite was executed to verify logic correctness  
- Backend test suite was debugged, fixed, and executed to ensure API stability  

This approach ensured coverage of both usability and system reliability, especially for M5 features like offline caching, synchronization, and API extensions.

---

## Features Tested

### 1. Authentication
- Valid login flow  
- Invalid credentials  
- Empty field validation  
- Network failure handling  
- Repeated login attempts  
- Session persistence after app restart  
- Logout behavior  

### 2. Job Management
- My Jobs screen loading  
- Job card rendering  
- Navigation to Job Detail  
- Pull-to-refresh functionality  

### 3. Job Detail
- Display of job information  
- Status timeline and updates  
- Navigation consistency  

### 4. Status Updates
- Status updates under normal conditions  
- UI feedback on update  
- Data consistency between screens  

### 5. Offline Functionality
- Cached job list availability  
- Cached job detail access  
- Offline banner visibility  
- Offline status updates (queued actions)  

### 6. Sync Behavior
- Reconnection after offline mode  
- Automatic syncing of queued actions  
- Data refresh after reconnect  

### 7. Device Features
- Tap-to-call functionality  
- Map navigation  

### 8. Push Notifications
- Notification delivery  
- Behavior when app is:
  - Closed  
  - Backgrounded  
  - Foregrounded  
- Notification tap behavior  

---

## Automated Testing Results

### Frontend Automated Tests

The frontend test suite was executed using Jest.

Results:
- All test suites passed  
- All test cases passed successfully  
- Covered areas included authentication logic, API interactions, job screens, offline queue behavior, and status updates  

Observation:
The frontend logic is stable at the unit and integration level. However, some inconsistencies still appeared during real-device testing, particularly related to UI state updates and caching behavior.

---

### Backend Testing and Fixes

Initially, the backend test suite failed significantly due to multiple structural and logical issues. I systematically debugged and resolved these issues to stabilize the test environment.

#### Issues Identified

- Test Discovery Conflict (tests.py vs tests/ directory)  
- Model–Test Schema Mismatch (outdated fields like `state`)  
- API Permission Failures (403 errors due to missing roles)  
- Pagination Mismatch (flat list vs paginated `results`)  
- Serializer Logic Issues (nested updates and stale totals)  

---

#### Actions Taken

- Resolved test structure conflict by consolidating tests into `myapp/tests/`  
- Updated fixtures to match current schema  
- Assigned correct roles to test users  
- Updated tests to handle pagination (`response.data["results"]`)  
- Fixed serializer logic for nested updates and total calculations  
- Cleaned project structure and removed temporary files  

---

### Backend Final Results

- 66 tests passed  
- 1 warning  
- Execution time: ~106 seconds  
- Command used: `pytest myapp/tests -v --reuse-db`  

The backend test suite is now stable, accurate, and aligned with the current implementation.

---

## Key Findings

### Working Features

- Login flow works correctly with valid credentials  
- Input validation for empty fields is consistent  
- Network errors are handled appropriately during login  
- My Jobs screen loads and refreshes correctly  
- Job Detail screen displays correct information under normal conditions  
- Status updates are successfully processed and synced with backend  
- Call and map features work correctly  
- Offline banner is displayed when network is unavailable  
- Cached job list remains accessible offline  
- Queued status updates sync correctly after reconnect  
- Push notifications are successfully delivered to the device  
- Session persistence and logout behavior work as expected  
- Frontend and backend automated tests both pass successfully  

---

### Issues Identified

- Push notification tap does not navigate to the specific Job Detail screen  
- Job Detail screen shows stale data until manually refreshed  
- Job Detail fails to load consistently from cache when offline  
- Offline status updates are not reflected consistently in Job Detail until synchronization  
- Foreground push notifications do not display a visible banner  

---

### Previously Existing Issues (Confirmed)

- Invalid login does not display an error message  
- Android shows Apple Maps as an option  
- Status update inconsistencies (partially overlapping)  

---

## Analysis

The system is functionally strong, particularly in backend integration and API stability. The backend is fully validated through automated tests, and core logic is reliable.

Most issues identified are related to frontend state management and UI synchronization rather than backend failures. Specifically:

- Inconsistent state between My Jobs and Job Detail  
- Partial offline experience due to UI not updating correctly  
- Missing navigation logic for push notifications  

This indicates that the underlying system works correctly, but frontend state handling and caching behavior require refinement.

---

## Limitations

- Testing was conducted only on Android platform  
- Push notifications were tested using manual payloads  
- Frontend automated tests validate logic but not full UI behavior  
- Backend validation was based on test suite execution rather than external API tools  

---

## Conclusion

The M5 QA process successfully validated both frontend and backend systems. Backend functionality is stable, with all tests passing and critical issues resolved. Frontend logic is also validated through automated testing, and core features work as expected.

Manual testing on a real device revealed several important issues related to state management, offline behavior, and user experience. These issues do not indicate system failure but highlight areas where refinement is needed.

Overall, the application meets the core M5 requirements, particularly in offline caching, synchronization, and API extensions. With improvements to frontend state consistency and notification behavior, the system will provide a more seamless and reliable user experience.

---

## Final Note

This QA process combined:

- Manual real-device testing  
- Automated frontend testing  
- Backend test validation and stabilization  

ensuring end-to-end coverage across the full application stack.