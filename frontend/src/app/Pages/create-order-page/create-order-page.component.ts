import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CreateOrderComponent } from "../../Componets/create-order/create-order.component";
import { BackComponent } from "../../Componets/back/back.component";

@Component({
  selector: 'app-create-order-page',
  imports: [CreateOrderComponent, BackComponent],
  templateUrl: './create-order-page.component.html',
  styleUrl: './create-order-page.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class CreateOrderPageComponent {

}
