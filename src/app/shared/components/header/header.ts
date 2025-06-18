import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
})
export default class Header {
  cartItemCount = 3; // Ejemplo, esto vendría de un servicio

  constructor() {}
}
