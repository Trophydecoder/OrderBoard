import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/services/auth.service';


@Component({
  selector: 'app-order-history',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  searchTerm = '';
  orders: any[] = [];
  filteredOrders: any[] = [];
  currentPage = 1;
  itemsPerPage = 15;
  isLoading = false;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.isLoading = true;
    this.auth.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter((o) =>
      o.customerName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }

  get paginatedOrders() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(start, start + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredOrders.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}



