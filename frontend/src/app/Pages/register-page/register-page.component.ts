import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RegisterComponent } from "../../Componets/register/register.component";

@Component({
  selector: 'app-register-page',
  imports: [RegisterComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {

}
