import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ServiceCard {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ServicesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('servicesTrack', { static: true }) servicesTrack!: ElementRef<HTMLElement>;
  @ViewChild('cardsContainer', { static: true }) cardsContainer!: ElementRef<HTMLElement>;

  private ctx!: gsap.Context;
  private horizontalTween!: gsap.core.Tween;
  private scrollTriggerInstance!: ScrollTrigger;
  private isMobile = false;
  private resizeObserver!: ResizeObserver;

  services: ServiceCard[] = [
    {
      icon: '🗺️',
      title: 'Gestión de Fincas',
      description: 'CRUD completo de parcelas con mapa interactivo. Visualiza tus campos, organiza cultivos y gestiona recursos desde un solo lugar.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: '🌦️',
      title: 'Alertas Climáticas',
      description: 'Detección de heladas y riesgo de hongos en tiempo real. Recibe notificaciones antes de que sea demasiado tarde.',
      gradient: 'from-sky-500 to-blue-600'
    },
    {
      icon: '📊',
      title: 'Dashboard Inteligente',
      description: 'Resumen ejecutivo de todas tus explotaciones. Métricas claras, tendencias visuales y decisiones informadas.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: '🔒',
      title: 'Acceso Seguro',
      description: 'Autenticación JWT, tus datos solo son tuyos. Encriptación de extremo a extremo y copias de seguridad automáticas.',
      gradient: 'from-violet-500 to-purple-600'
    }
  ];

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.checkScreenSize();
    this.initAnimations();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    // Solo reiniciar si cambió el estado
    if (wasMobile !== this.isMobile) {
      this.cleanupAnimations();
      this.initAnimations();
    }
  }

  private cleanupAnimations(): void {
    if (this.ctx) {
      this.ctx.revert();
    }
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
    if (this.horizontalTween) {
      this.horizontalTween.kill();
    }
  }

  private initAnimations(): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.isMobile) {
        this.initVerticalLayout();
      } else {
        this.initHorizontalScroll();
      }
    });
  }

  private initHorizontalScroll(): void {
    const track = this.servicesTrack.nativeElement;
    const cards = this.cardsContainer.nativeElement;
    const cardElements = gsap.utils.toArray<HTMLElement>('.service-card');

    // Reset inline styles
    gsap.set(cards, { x: 0 });
    track.style.overflow = 'hidden';

    this.ctx = gsap.context(() => {
      // Calculate scroll distance
      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        return -(trackWidth - viewportWidth);
      };

      // Horizontal scroll animation
      this.horizontalTween = gsap.to(cards, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: track,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (this.services.length - 1),
            duration: { min: 0.2, max: 0.5 },
            ease: 'power2.inOut'
          },
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          invalidateOnRefresh: true
        }
      });

      this.scrollTriggerInstance = this.horizontalTween.scrollTrigger as ScrollTrigger;

      // Individual card animations
      cardElements.forEach((card) => {
        const icon = card.querySelector('.card-icon');
        const content = card.querySelector('.card-content');
        const decorative = card.querySelector('.card-decorative');

        if (icon) {
          gsap.from(icon, {
            scale: 0,
            rotation: -15,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: card,
              containerAnimation: this.horizontalTween,
              start: 'left 80%',
              toggleActions: 'play none none reverse'
            }
          });
        }

        if (content) {
          gsap.from(content, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: this.horizontalTween,
              start: 'left 70%',
              toggleActions: 'play none none reverse'
            }
          });
        }

        if (decorative) {
          gsap.from(decorative, {
            scale: 0.8,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: this.horizontalTween,
              start: 'left 90%',
              toggleActions: 'play none none reverse'
            }
          });
        }
      });

      // Section header animation
      gsap.from('.services-header', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: track,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // Progress indicator animation
      gsap.from('.scroll-progress', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: track,
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      });

    }, this.el.nativeElement);
  }

  private initVerticalLayout(): void {
    const track = this.servicesTrack.nativeElement;
    const cardElements = gsap.utils.toArray<HTMLElement>('.service-card');

    // Reset styles for vertical layout
    gsap.set(this.cardsContainer.nativeElement, { x: 0 });
    track.style.overflow = 'visible';

    this.ctx = gsap.context(() => {
      // Section header animation
      gsap.from('.services-header', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: track,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // Card animations for vertical layout
      cardElements.forEach((card, i) => {
        const icon = card.querySelector('.card-icon');
        const content = card.querySelector('.card-content');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });

        if (icon) {
          tl.from(icon, {
            scale: 0,
            rotation: -15,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(1.7)'
          }, i * 0.1);
        }

        if (content) {
          tl.from(content, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out'
          }, '-=0.4');
        }
      });
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.cleanupAnimations();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
