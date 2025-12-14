import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login and save tokens', () => {
      const mockResponse = { access: 'access-token', refresh: 'refresh-token' };
      const username = 'testuser';
      const password = 'testpass';

      service.login(username, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.access).toBe('access-token');
        expect(service.refreshT).toBe('refresh-token');
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}login/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      req.flush(mockResponse);
    });

    it('should handle login errors', () => {
      const username = 'testuser';
      const password = 'wrongpass';

      service.login(username, password).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}login/`);
      req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register a new user', () => {
      const mockResponse = { id: 1, username: 'newuser', email: 'new@test.com' };
      const username = 'newuser';
      const email = 'new@test.com';
      const password = 'password123';

      service.register(username, email, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}register/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, email, password });
      req.flush(mockResponse);
    });
  });

  describe('refresh', () => {
    it('should refresh access token', () => {
      const refreshToken = 'refresh-token';
      const mockResponse = { access: 'new-access-token' };

      service.refresh(refreshToken).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.access).toBe('new-access-token');
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}token/refresh/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refresh: refreshToken });
      req.flush(mockResponse);
    });
  });

  describe('saveTokens', () => {
    it('should save tokens to localStorage', () => {
      const tokens = { access: 'access-token', refresh: 'refresh-token' };
      
      service.saveTokens(tokens);
      
      expect(localStorage.getItem('access')).toBe('access-token');
      expect(localStorage.getItem('refresh')).toBe('refresh-token');
    });
  });

  describe('logout', () => {
    it('should remove tokens from localStorage', () => {
      localStorage.setItem('access', 'token');
      localStorage.setItem('refresh', 'refresh-token');
      
      service.logout();
      
      expect(localStorage.getItem('access')).toBeNull();
      expect(localStorage.getItem('refresh')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('access', 'token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when access token does not exist', () => {
      localStorage.removeItem('access');
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset', () => {
      const identifier = 'user@example.com';
      const mockResponse = { ok: true };

      service.requestPasswordReset(identifier).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}password-reset/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ identifier });
      req.flush(mockResponse);
    });
  });

  describe('access and refreshT getters', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('access', 'test-access-token');
      expect(service.access).toBe('test-access-token');
    });

    it('should return refresh token from localStorage', () => {
      localStorage.setItem('refresh', 'test-refresh-token');
      expect(service.refreshT).toBe('test-refresh-token');
    });

    it('should return null when tokens do not exist', () => {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      expect(service.access).toBeNull();
      expect(service.refreshT).toBeNull();
    });
  });
});

