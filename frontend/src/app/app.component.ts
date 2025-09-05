// Angular import
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';

// 👇 NEW: import the AuthService we built
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [SpinnerComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);  // 👈 NEW: inject service

  title = 'datta-able';

  ngOnInit() {
    // keep your existing scroll behavior
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });

    
  }
}
