import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HowItWorksComponent implements AfterViewInit, OnDestroy {
  private ctx!: gsap.Context;
  private scrollTriggers: ScrollTrigger[] = [];

  steps: Step[] = [
    {
      number: 1,
      title: 'Registra tus fincas',
      description: 'Añade parcelas con nombre, cultivo, hectáreas y coordenadas GPS. Organiza toda tu explotación en minutos.',
      icon: '🗺️'
    },
    {
      number: 2,
      title: 'Monitoriza el clima',
      description: 'El sistema consulta OpenWeatherMap y analiza temperatura y humedad en tiempo real para cada una de tus parcelas.',
      icon: '🌦️'
    },
    {
      number: 3,
      title: 'Recibe alertas inteligentes',
      description: 'Si detecta riesgo de helada (<2°C) o proliferación de hongos (humedad >80%), te avisamos al instante vía email o push.',
      icon: '🔔'
    }
  ];

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initAnimations();
    });
  }

  private initAnimations(): void {
    this.ctx = gsap.context(() => {
      // Header animation
      gsap.from('.hiw-header', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.hiw-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      // Connector line draw animation
      const lineTrigger = ScrollTrigger.create({
        trigger: '#how-it-works',
        start: 'top 60%',
        end: 'bottom 60%',
        scrub: true,
        onUpdate: (self) => {
          const line = this.el.nativeElement.querySelector('.connector-line-fill');
          if (line) {
            line.style.transform = `scaleY(${self.progress})`;
          }
        }
      });
      this.scrollTriggers.push(lineTrigger);

      // Step items animations
      const stepItems = gsap.utils.toArray<HTMLElement>('.step-item');

      stepItems.forEach((step, i) => {
        const isEven = i % 2 === 0;
        const direction = isEven ? -80 : 80;

        const stepTl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 75%',
            end: 'top 30%',
            toggleActions: 'play none none reverse'
          }
        });

        this.scrollTriggers.push(stepTl.scrollTrigger!);

        // Number reveal with back.out
        stepTl.from(step.querySelector('.step-number'), {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: 'back.out(1.7)'
        });

        // Content from side
        stepTl.from(step.querySelector('.step-content'), {
          x: direction,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out'
        }, '-=0.2');

        // Mockup from opposite side
        stepTl.from(step.querySelector('.step-mockup'), {
          x: -direction,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out'
        }, '-=0.7');

        // Icon animation
        stepTl.from(step.querySelector('.step-icon'), {
          rotation: -180,
          scale: 0,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(1.7)'
        }, '-=0.4');
      });

    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    // Clean up GSAP context
    if (this.ctx) {
      this.ctx.revert();
    }

    // Kill all ScrollTriggers
    this.scrollTriggers.forEach(st => st.kill());
    this.scrollTriggers = [];
  }
}
