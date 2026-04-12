import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TestimonialsComponent implements AfterViewInit, OnDestroy {
  private ctx!: gsap.Context;
  private tickerTween!: gsap.core.Tween;
  private isMobile = false;

  testimonials: Testimonial[] = [
    {
      id: 1,
      quote: 'Gracias a AgroConnect detecté una helada a tiempo y salvé mi cosecha de tomates. El sistema alertó a las 3 AM y pude activar los aspersores.',
      name: 'Carlos M.',
      role: 'Agricultor',
      location: 'Murcia',
      avatar: '👨‍🌾'
    },
    {
      id: 2,
      quote: 'El sistema de alertas es increíblemente preciso. Ya no tengo que revisar el tiempo cada hora, AgroConnect me avisa solo cuando hay riesgo real.',
      name: 'Ana P.',
      role: 'Viticultura',
      location: 'La Rioja',
      avatar: '👩‍🌾'
    },
    {
      id: 3,
      quote: 'Por fin una herramienta pensada para el agricultor de verdad, no para empresas. La interfaz es sencilla y todo funciona perfecto en el móvil.',
      name: 'José L.',
      role: 'Olivicultura',
      location: 'Jaén',
      avatar: '👨‍🌾'
    }
  ];

  // Duplicate testimonials for infinite loop (solo en desktop)
  allTestimonials = [...this.testimonials, ...this.testimonials];

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.checkScreenSize();
    this.ngZone.runOutsideAngular(() => {
      this.initAnimations();
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    const wasMobile = this.isMobile;
    this.checkScreenSize();

    if (wasMobile !== this.isMobile) {
      this.cleanupAnimations();
      this.initAnimations();
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  private cleanupAnimations(): void {
    if (this.ctx) {
      this.ctx.revert();
    }
    if (this.tickerTween) {
      this.tickerTween.kill();
    }
  }

  private initAnimations(): void {
    this.ctx = gsap.context(() => {
      // Header animation
      gsap.from('.testimonials-header', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.testimonials-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      // Solo activar ticker en desktop
      if (!this.isMobile) {
        const track = this.el.nativeElement.querySelector('.testimonials-track');
        if (track) {
          this.tickerTween = gsap.to(track, {
            x: '-50%',
            duration: 30,
            ease: 'none',
            repeat: -1
          });

          // Pause on hover
          track.addEventListener('mouseenter', () => {
            this.tickerTween?.pause();
          });

          track.addEventListener('mouseleave', () => {
            this.tickerTween?.resume();
          });
        }
      }

      // Individual card entrance animation
      gsap.from('.testimonial-card', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // Quote marks animation
      gsap.from('.quote-mark', {
        scale: 0,
        rotation: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      });

    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.cleanupAnimations();
  }
}
