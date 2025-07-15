import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsComponent } from "../../Componets/settings/settings.component";
import { BackComponent } from "../../Componets/back/back.component";

@Component({
  selector: 'app-settings-page',
  imports: [SettingsComponent, BackComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {

}
