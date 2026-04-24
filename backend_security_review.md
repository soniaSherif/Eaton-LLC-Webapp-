# Backend Security Review

## Overview
This review evaluates the backend API implementation for the deliverable: Conduct security review (token storage, API auth, encryption).

Scope reviewed:
- Authentication configuration and token flow
- Authorization and ownership checks in API views
- Token issuance, refresh, validation, and related secret handling
- Transport and deployment security assumptions
- Error handling and potential data exposure

Verification method:
- Inspected Django settings and REST framework auth configuration in backend/backend_project/settings.py.
- Inspected route exposure in backend/backend_project/urls.py and backend/myapp/urls.py.
- Inspected endpoint permissions and queryset restrictions in backend/myapp/views.py and backend/myapp/permissions.py.
- Inspected serializer field exposure in backend/myapp/serializers.py.
- Inspected token/OTP model behavior in backend/myapp/models.py.
- Inspected development deployment defaults in docker-compose.yml.

## Authentication Review
Current implementation:
- DRF uses JWT auth globally via REST_FRAMEWORK DEFAULT_AUTHENTICATION_CLASSES with rest_framework_simplejwt.authentication.JWTAuthentication (backend/backend_project/settings.py:164-166).
- Global default permission is IsAuthenticated (backend/backend_project/settings.py:168-170), then selectively overridden per view.
- Token endpoints are exposed at /api/token/ and /api/token/refresh/ in project URLs (backend/backend_project/urls.py:29-30), and /api/token/verify/ in app URLs (backend/myapp/urls.py:50).
- Additional auth endpoints exist for register/login/password reset in app URLs (backend/myapp/urls.py:47-50).

Protected endpoints behavior:
- Most CRUD endpoints are protected by IsManager, IsManagerOrDriver, or IsAuthenticated in view classes (for example backend/myapp/views.py:68-101, 212-307, 440-648).
- Public endpoints are explicitly allowed where expected:
  - RegisterView uses AllowAny (backend/myapp/views.py:346-349)
  - AuthViewSet (password reset flows) uses AllowAny (backend/myapp/views.py:686-687)
  - SimpleJWT obtain/refresh/verify endpoints are designed for unauthenticated token workflows.

Potentially sensitive public exposure:
- API docs/schema are publicly routed under /api/schema, /api/docs, /api/redoc (backend/myapp/urls.py:41-43).
- Route duplication expands exposed surface:
  - /api/* and /myapp/* both include same app routes (backend/backend_project/urls.py:31-32)
  - Root-level /auth/* also exists through project router include (backend/backend_project/urls.py:26-33)

Risk level: Medium

Recommendation:
- Keep intended public endpoints, but reduce accidental exposure by removing duplicate route prefixes and deciding on one canonical API base path.
- Consider restricting docs endpoints to authenticated/admin users outside local development.

## Authorization / Access Control Review
Current implementation:
- Role permissions are defined with Django groups:
  - IsManager (backend/myapp/permissions.py:3-12)
  - IsDriver (backend/myapp/permissions.py:15-24)
  - IsManagerOrDriver (backend/myapp/permissions.py:27-34)
- Several endpoints include user-scoped filtering for driver users:
  - DriverViewSet.get_queryset filters to request.user for Driver group (backend/myapp/views.py:224-231)
  - InvoiceViewSet.get_queryset filters invoices to submitted_by_driver user (backend/myapp/views.py:456-460)
  - PayReportViewSet and PayReportLineViewSet filter queryset to driver-owned records for driver users (backend/myapp/views.py:505-522, 650-667)

Findings:
1) JobDriverAssignmentViewSet over-permissive for driver users
- View uses IsManagerOrDriver on full ModelViewSet (backend/myapp/views.py:94-101) with broad queryset.
- Ownership check exists only in custom status action (backend/myapp/views.py:137-140).
- Standard list/retrieve/update/delete/create paths do not enforce driver ownership, so driver-role users may access or mutate assignment records beyond their own via default actions.

Risk level: High

Recommendation:
- Restrict JobDriverAssignmentViewSet by action:
  - Manager-only for create/update/delete/list-all
  - Driver-only scoped reads for self
  - Keep explicit ownership validation on any driver write operation.

2) PayReport and PayReportLine create paths lack explicit ownership guard
- PayReportViewSet has filtered reads, but perform_create does not validate that a driver user can only create for self (backend/myapp/views.py:531-533).
- PayReportLineViewSet perform_create does not validate ownership of target report for driver users (backend/myapp/views.py:673-676).

Risk level: High

Recommendation:
- Enforce object-level ownership checks in create paths (and serializer validation) for driver users.

3) Device token reassignment possibility
- DeviceTokenViewSet.create uses update_or_create(token=token_value, defaults={user=request.user,...}) (backend/myapp/views.py:331-335).
- Because token is globally unique (backend/myapp/models.py:186), a valid token value could be reassigned to another authenticated user.

Risk level: Medium

Recommendation:
- Require ownership proof before re-binding an existing token, or prevent cross-user token reassignment unless performed by admin logic.

## Token Security Review
Current implementation:
- JWT token issuance and refresh:
  - CustomTokenObtainPairView (backend/myapp/views.py:356-364)
  - CustomTokenRefreshView (backend/myapp/views.py:366-367)
  - Token verify endpoint wired in URLs (backend/myapp/urls.py:50)
- JWT settings:
  - Access token lifetime 1 day, refresh token lifetime 7 days (backend/backend_project/settings.py:175-176)
  - Refresh rotation enabled and blacklist-after-rotation enabled (backend/backend_project/settings.py:177-178)
- Password reset OTP is stored hashed with salt, includes expiry, attempt counter, and one-time-use behavior (backend/myapp/models.py:395-432).

Findings:
1) Hardcoded Django SECRET_KEY
- SECRET_KEY is hardcoded in settings file (backend/backend_project/settings.py:28).

Risk level: High

Recommendation:
- Move SECRET_KEY to environment variables immediately and rotate the key for non-local deployments.

2) Token blacklist config likely incomplete
- BLACKLIST_AFTER_ROTATION is enabled (backend/backend_project/settings.py:178), but rest_framework_simplejwt.token_blacklist is not present in INSTALLED_APPS in reviewed settings.

Risk level: Medium

Recommendation:
- Add rest_framework_simplejwt.token_blacklist to INSTALLED_APPS and run migrations, or disable blacklist-related settings if not used.

3) Good practice observed in OTP handling
- OTP plaintext is not stored; code_hash + salt + expiry + attempts + used flags are implemented (backend/myapp/models.py:397-431).

Risk level: Low

Recommendation:
- Keep current OTP hashing and rate-limit pattern; add centralized audit logging for OTP failures if required by policy.

## Encryption / Transport Security Review
Current implementation:
- CORS is not fully open and uses explicit allowed origins (backend/backend_project/settings.py:150-155).
- Database SSL can be required via environment flag DATABASE_SSL_REQUIRE (backend/backend_project/settings.py:99-104).
- SMTP uses TLS by default (EMAIL_USE_TLS=True) (backend/backend_project/settings.py:186-188).
- Development deployment runs Django dev server over HTTP in docker-compose (docker-compose.yml).

Findings:
1) No explicit HTTPS enforcement settings found
- No visible SSL redirect/HSTS secure-cookie settings in reviewed settings.
- JWT bearer authentication relies on secure transport in production.

Risk level: Medium

Recommendation:
- Add production security settings (for example SECURE_SSL_REDIRECT, SECURE_HSTS_SECONDS, secure cookies, proxy SSL header where applicable).

2) Development defaults are clearly non-production
- DEBUG=True and local hosts are configured (backend/backend_project/settings.py:31-33).
- Docker command runs runserver (docker-compose.yml), which is appropriate for development only.

Risk level: Medium (if promoted to production unchanged)

Recommendation:
- Maintain separate production settings module and deployment checklist to avoid accidental insecure promotion.

## Error Handling / Data Exposure Review
Current implementation:
- Login failure handling uses generic invalid-credentials response without exposing whether username exists (backend/myapp/views.py:356-364).
- Password reset endpoints intentionally avoid account enumeration by returning success-like responses (backend/myapp/views.py:698-711, 721-725, 737-741).
- UserSerializer marks password write_only (backend/myapp/serializers.py:167-171).

Findings:
1) Debug mode enabled
- DEBUG=True (backend/backend_project/settings.py:31) can expose stack traces and internal data in error responses in non-dev deployments.

Risk level: High

Recommendation:
- Ensure DEBUG=False in all non-local environments and use sanitized error handlers/logging.

2) Broad serializer exposure via fields = '__all__'
- Multiple serializers expose all model fields (for example backend/myapp/serializers.py:151-154, 156-160, and other serializers using __all__).
- This can unintentionally expose sensitive business or personal fields as models evolve.

Risk level: Medium

Recommendation:
- Replace __all__ with explicit allowlists for externally exposed serializers.

3) Console prints include raw exception text
- Error paths print exception details in email and push notification helpers (backend/myapp/views.py:62-63, 208-209; backend/myapp/emails.py:10-11, 34-39).

Risk level: Low

Recommendation:
- Use structured logging with environment-aware redaction and avoid raw exception strings in production logs.

## Risk Summary Table
| Area | Current implementation summary | Risk | Recommendation |
|---|---|---|---|
| API Authentication | JWT auth configured globally with IsAuthenticated default; expected public auth endpoints exist | Medium | Keep public auth endpoints, reduce duplicate route exposure, optionally restrict docs in non-dev |
| Authorization / Access Control | Group-based permissions implemented, but some write paths lack strict ownership checks | High | Add object-level checks for JobDriverAssignment, PayReport create, and PayReportLine create |
| Token Security | JWT issue/refresh/verify present; OTP stored hashed; SECRET_KEY hardcoded; blacklist setting may be incomplete | High | Externalize and rotate SECRET_KEY; enable token blacklist app if using blacklist behavior |
| Encryption / Transport Security | CORS constrained; SMTP TLS and optional DB SSL present; no explicit HTTPS enforcement settings | Medium | Add production transport hardening (SSL redirect, HSTS, secure cookies, proxy SSL config) |
| Error Handling / Data Exposure | Good anti-enumeration patterns; DEBUG on and broad serializer exposure present | High | Disable DEBUG outside local dev; move serializers to explicit field allowlists |

## Recommendations
Priority 1 (immediate):
1. Move SECRET_KEY to environment variables and rotate it for deployment targets.
2. Disable DEBUG in non-local environments.
3. Implement object-level authorization for JobDriverAssignment standard actions and PayReport/PayReportLine create actions.

Priority 2 (short term):
1. Remove duplicate URL exposure paths (/myapp/* and root /auth/* unless explicitly required).
2. Add SimpleJWT token blacklist app if BLACKLIST_AFTER_ROTATION is expected to work.
3. Replace serializer fields = '__all__' on externally exposed endpoints with explicit field lists.

Priority 3 (hardening):
1. Add production HTTPS/security settings (SSL redirect, HSTS, secure cookies).
2. Restrict API docs visibility in production.
3. Replace print-based error handling with structured, sanitized logging.

## Conclusion
The backend has a solid foundation in several areas: JWT-based authentication, default authenticated API posture, role-based permissions, password write-only serializer handling, and hashed OTP reset flow.

The most important gaps are authorization hardening and production security posture: several driver-accessible write paths need stronger ownership validation, and key deployment settings (SECRET_KEY handling, DEBUG, HTTPS enforcement) must be tightened before production use. Overall, this is a workable implementation for development and coursework, with clear remediation steps to reach stronger production-grade security.