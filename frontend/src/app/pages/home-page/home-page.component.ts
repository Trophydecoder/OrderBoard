import { Component } from '@angular/core';
import { WelcomeDashComponent } from "../../Components/welcome-dash/welcome-dash.component";
import { SidenavComponent } from "../../Components/sidenav/sidenav.component";

@Component({
  selector: 'app-home-page',
  imports: [WelcomeDashComponent, SidenavComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
