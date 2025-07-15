import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResetPasswordComponent } from "../../Componets/reset-password/reset-password.component";

@Component({
  selector: 'app-reset-password-page',
  imports: [ResetPasswordComponent],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ResetPasswordPageComponent {

}
