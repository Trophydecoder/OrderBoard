import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../../services/services/auth.service';
@Component({
  selector: 'app-frequent-customers',
  imports: [CommonModule, RouterModule],
  templateUrl: './frequent-customers.component.html',
  styleUrl: './frequent-customers.component.scss'
})
export class FrequentCustomersComponent {
  frequentCustomers: any[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.getFrequentCustomers().subscribe({
      next: (res) => this.frequentCustomers = res,
      error: (err) => console.error(err)
    });
  }

  quickOrder(name: string) {
    this.router.navigate(['/create-order'], { queryParams: { customer: name } });
  }
}

