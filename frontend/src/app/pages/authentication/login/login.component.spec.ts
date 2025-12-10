import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

class AuthServiceStub {
  login = jasmine.createSpy().and.returnValue(of(void 0));
}

class RouterStub {
  navigateByUrl = jasmine.createSpy('navigateByUrl');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let auth: AuthServiceStub;
  let router: RouterStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: Router, useClass: RouterStub },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthService) as unknown as AuthServiceStub;
    router = TestBed.inject(Router) as unknown as RouterStub;
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
