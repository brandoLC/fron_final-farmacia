import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Header from '../../shared/components/header/header';
import Footer from '../../shared/components/footer/footer';

@Component({
  selector: 'app-main-layout',
  imports: [Header, RouterOutlet, Footer],
  templateUrl: './main-layout.html',
})
export default class MainLayout {}
