import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

class AuthServiceStub {
  login = jasmine.createSpy().and.returnValue(of(void 0));
}

class ActivatedRouteStub {
  snapshot = {
    queryParams: {}
  };
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let auth: AuthServiceStub;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthService) as unknown as AuthServiceStub;
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submits and navigates on success', () => {
    component.form.setValue({ username: 'u', password: 'p' });
    component.submit();
    expect(auth.login).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/daily-board');
  });

  it('shows error on failure', () => {
    auth.login.and.returnValue(throwError(() => new Error('bad')));
    component.form.setValue({ username: 'u', password: 'p' });
    component.submit();
    expect(component.error).toContain('Invalid');
  });
});
