import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/services/auth.service';
import { jwtDecode } from 'jwt-decode';





@Component({
  selector: 'app-dash-board',
  imports: [CommonModule], 
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.scss'
})
export class DashBoardComponent implements OnInit  {
  username: string = '';
  monthlyOrders: number = 0;
  plan: string = 'free'; // default to "free" lowercase for badge class

  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token);
        this.username = decoded.username;
      }
    }
    

    // Fetch  monthlyOrderss and plan
    this.auth.getProfile().subscribe({
      next: (res: any) => {
        this.monthlyOrders = res.monthlyOrders || 0;
        this.plan = (res.plan || 'free').toLowerCase(); // Normalize plan
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load your profile.',
          confirmButtonColor: '#0B3D91'
          
        });
      }
    });
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }


}
