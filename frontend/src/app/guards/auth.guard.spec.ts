import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { runInInjectionContext, Injector } from '@angular/core';
import { authGuard } from './auth.guard';

describe('AuthGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let injector: Injector;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    injector = TestBed.inject(Injector);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(authGuard).toBeDefined();
  });

  it('should allow access when access token exists', () => {
    localStorage.setItem('access', 'test-token');

    const result = runInInjectionContext(injector, () => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when access token does not exist', () => {
    localStorage.removeItem('access');
    const mockUrlTree = {} as any;
    router.createUrlTree.and.returnValue(mockUrlTree);

    const result = runInInjectionContext(injector, () => authGuard(mockRoute, mockState));

    expect(result).toBe(mockUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should redirect to login when access token is empty string', () => {
    localStorage.setItem('access', '');
    const mockUrlTree = {} as any;
    router.createUrlTree.and.returnValue(mockUrlTree);

    const result = runInInjectionContext(injector, () => authGuard(mockRoute, mockState));

    expect(result).toBe(mockUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});

