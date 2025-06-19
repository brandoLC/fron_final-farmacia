import { Component, OnInit, signal } from '@angular/core';
import { HeaderSearch } from './header-search/header-search';
import { HeaderNavigation } from './header-navigation/header-navigation';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [HeaderSearch, HeaderNavigation],
  templateUrl: './header.html',
})
export default class Header implements OnInit {
  cartItemCount = 3; // Ejemplo, esto vendría de un servicio
  showBanner1 = signal<boolean>(true);

  ngOnInit(): void {
    setInterval(() => {
      this.showBanner1.update((v) => !v); // Alterna entre true y false
    }, 5000);
  }
}
