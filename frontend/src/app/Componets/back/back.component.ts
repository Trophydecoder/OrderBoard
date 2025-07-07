import { Component } from '@angular/core';

@Component({
  selector: 'app-back',
  imports: [],
  templateUrl: './back.component.html',
  styleUrl: './back.component.scss'
})
export class BackComponent {
  goBack() {
    window.history.back();
  }
}
