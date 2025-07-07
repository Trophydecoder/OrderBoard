import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-create-order',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.scss'
})
export class CreateOrderComponent {
  orderForm: FormGroup;
  isLoading = false;

  constructor(private auth: AuthService, private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      whatsappNumber: ['', [Validators.required, Validators.pattern(/^(0\d{9}|\+27\d{9})$/)]],
      products: this.fb.array([this.createProductGroup()])
    });
  }

  get products(): FormArray {
    return this.orderForm.get('products') as FormArray;
  }

  private createProductGroup(): FormGroup {
    return this.fb.group({
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addProduct() {
    this.products.push(this.createProductGroup());
  }

  removeProduct(index: number): void {
    if (this.products.length > 1) {
      this.products.removeAt(index);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'At least one product is required.',
        confirmButtonColor: '#0B3D91'
      });
    }
  }

  private convertToInternational(num: string): string {
    return num.startsWith('0') ? '+27' + num.substring(1) : num;
  }

  sendSlip() {
    if (this.orderForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill out all required fields correctly.',
        confirmButtonColor: '#0B3D91'
      });
      return;
    }

    const formValue = { ...this.orderForm.value };
    formValue.whatsappNumber = this.convertToInternational(formValue.whatsappNumber);

    const items = formValue.products.map((item: any) => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price
    }));

    const totalPrice = formValue.products.reduce(
      (acc: number, curr: any) => acc + parseFloat(curr.price), 0
    );

    const payload = {
      customerName: formValue.customerName,
      whatsappNumber: formValue.whatsappNumber,
      items,
      totalPrice
    };

    console.log('Payload being sent:', payload); // 🪵 Debug log

    // Show SweetAlert loading
    Swal.fire({
      title: 'Sending Order Slip...',
      text: 'Please wait while we send your order.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      confirmButtonColor: '#0B3D91'
    });

    this.isLoading = true;

    this.auth.createOrder(payload).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Order Sent!',
          text: 'The order slip was successfully sent via WhatsApp.',
          confirmButtonColor: '#0B3D91'
        });
        this.orderForm.reset();
        this.products.clear();
        this.addProduct();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Send Slip error:', err); // 🪵 Log error
        Swal.fire({
          icon: 'error',
          title: 'Failed to Send Slip',
          text: 'Something went wrong while sending the order.',
          confirmButtonColor: '#0B3D91'
        });
      }
      
    });
  }
}
