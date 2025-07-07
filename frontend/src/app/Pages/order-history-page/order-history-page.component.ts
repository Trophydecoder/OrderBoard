import { Component } from '@angular/core';
import { OrderHistoryComponent } from "../../Componets/order-history/order-history.component";
import { BackComponent } from "../../Componets/back/back.component";

@Component({
  selector: 'app-order-history-page',
  imports: [OrderHistoryComponent, BackComponent],
  templateUrl: './order-history-page.component.html',
  styleUrl: './order-history-page.component.scss'
})
export class OrderHistoryPageComponent {

}
