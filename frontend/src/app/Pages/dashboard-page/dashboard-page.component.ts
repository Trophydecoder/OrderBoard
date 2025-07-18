import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashBoardComponent } from "../../Componets/dash-board/dash-board.component";

@Component({
  selector: 'app-dashboard-page',
  imports: [DashBoardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {

}
