// angular import
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService, NotificationItem } from 'src/app/services/notification.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  notifications$ = this.notificationSvc.notifications$;
  get username() { return this.auth.username || 'User'; }

  // constructor
  constructor(private router: Router, private auth: AuthService, private notificationSvc: NotificationService) {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }

  clearNotifications(): void {
    this.notificationSvc.clear();
  }

  removeNotification(id: number): void {
    this.notificationSvc.clearOne(id);
  }
}
