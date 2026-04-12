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

interface Stat {
  id: string;
  value: number;
  suffix: string;
  prefix: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  private ctx!: gsap.Context;
  private scrollTriggerInstance!: ScrollTrigger;

  stats: Stat[] = [
    {
      id: 'stat-farmers',
      value: 2400,
      prefix: '+',
      suffix: '',
      label: '2.400',
      description: 'agricultores confían en AgroConnect'
    },
    {
      id: 'stat-hectares',
      value: 18000,
      prefix: '+',
      suffix: '',
      label: '18.000',
      description: 'hectáreas gestionadas'
    },
    {
      id: 'stat-accuracy',
      value: 98,
      prefix: '',
      suffix: '%',
      label: '98%',
      description: 'precisión en alertas climáticas'
    },
    {
      id: 'stat-alerts',
      value: 47000,
      prefix: '+',
      suffix: '',
      label: '47.000',
      description: 'alertas enviadas este año'
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
      gsap.from('.stats-header', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.stats-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      // Counter cards stagger animation
      gsap.from('.stat-card', {
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.stats-grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      // Counter animation - only runs once
      this.scrollTriggerInstance = ScrollTrigger.create({
        trigger: '#stats-section',
        start: 'top 70%',
        once: true,
        onEnter: () => this.animateCounters()
      });

      // Background grid animation
      gsap.to('.grid-line', {
        opacity: 0.3,
        duration: 1,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#stats-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

    }, this.el.nativeElement);
  }

  private animateCounters(): void {
    this.stats.forEach((stat) => {
      const element = this.el.nativeElement.querySelector(`#${stat.id}`);
      if (element) {
        const counterObj = { val: 0 };

        gsap.to(counterObj, {
          val: stat.value,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: function(this: any) {
            const val = Math.round(this.targets()[0].val);
            const formatted = val.toLocaleString('es-ES');
            element.textContent = stat.prefix + formatted + stat.suffix;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.ctx) {
      this.ctx.revert();
    }

    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
  }
}
