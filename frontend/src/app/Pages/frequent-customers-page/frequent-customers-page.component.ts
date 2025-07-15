import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FrequentCustomersComponent } from "../../Componets/frequent-customers/frequent-customers.component";
import { BackComponent } from "../../Componets/back/back.component";

@Component({
  selector: 'app-frequent-customers-page',
  imports: [FrequentCustomersComponent, BackComponent],
  templateUrl: './frequent-customers-page.component.html',
  styleUrl: './frequent-customers-page.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class FrequentCustomersPageComponent {

}
