import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BannerSlide {
  id: number;
  type: 'single' | 'double';
  images: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
})
export default class Home implements OnInit, OnDestroy {
  // Configuración de slides
  slides: BannerSlide[] = [
    {
      id: 1,
      type: 'single',
      images: ['assets/home/primera-fila/primera-fila-1.avif'],
    },
    {
      id: 2,
      type: 'double',
      images: [
        'assets/home/primera-fila/primera-fila-2-1.avif',
        'assets/home/primera-fila/primera-fila-2-2.avif',
      ],
    },
    {
      id: 3,
      type: 'single',
      images: ['assets/home/primera-fila/primera-fila-3.avif'],
    },
    {
      id: 4,
      type: 'double',
      images: [
        'assets/home/primera-fila/primera-fila-4-1.avif',
        'assets/home/primera-fila/primera-fila-4-2.avif',
      ],
    },
    {
      id: 5,
      type: 'single',
      images: ['assets/home/primera-fila/primera-fila-5.avif'],
    },
  ];

  // Signals para el estado del carousel
  currentSlide = signal(0);
  isAnimating = signal(false);
  isPaused = signal(false);

  private intervalId: any = null;

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  // Iniciar autoplay
  startAutoplay() {
    this.intervalId = setInterval(() => {
      if (!this.isPaused()) {
        this.nextSlide();
      }
    }, 4500); // Cambiar cada 4.5 segundos
  }

  // Detener autoplay
  stopAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Pausar en hover
  pauseCarousel() {
    this.isPaused.set(true);
  }

  // Reanudar cuando sale el hover
  resumeCarousel() {
    this.isPaused.set(false);
  }

  // Ir al siguiente slide
  nextSlide() {
    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    setTimeout(() => {
      this.currentSlide.update((current) =>
        current === this.slides.length - 1 ? 0 : current + 1
      );
      this.isAnimating.set(false);
    }, 100);
  }

  // Ir al slide anterior
  prevSlide() {
    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    setTimeout(() => {
      this.currentSlide.update((current) =>
        current === 0 ? this.slides.length - 1 : current - 1
      );
      this.isAnimating.set(false);
    }, 100);
  }

  // Ir a un slide específico
  goToSlide(index: number) {
    if (this.isAnimating() || index === this.currentSlide()) return;

    this.isAnimating.set(true);
    setTimeout(() => {
      this.currentSlide.set(index);
      this.isAnimating.set(false);
    }, 100);
  }

  // Manejar errores de imagen
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/800x400?text=Banner+No+Disponible';
  }
}
