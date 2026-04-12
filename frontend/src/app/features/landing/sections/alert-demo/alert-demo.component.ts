import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-alert-demo',
  templateUrl: './alert-demo.component.html',
  styleUrls: ['./alert-demo.component.scss'],
  standalone: true
})
export class AlertDemoComponent implements AfterViewInit, OnDestroy {
  private ctx!: gsap.Context;
  private scrollTriggerInstance!: ScrollTrigger;
  private timeline!: gsap.core.Timeline;

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initAnimations();
    });
  }

  private initAnimations(): void {
    this.ctx = gsap.context(() => {
      // Header animation
      gsap.from('.alert-header', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.alert-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      // Main timeline for the demo sequence
      this.timeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#alert-demo',
          start: 'top 60%',
          toggleActions: 'play none none reverse',
          onEnter: () => this.animateTemperature()
        }
      });

      this.scrollTriggerInstance = this.timeline.scrollTrigger!;

      // 1. Map mock slides in from left
      this.timeline.from('.demo-map', {
        x: -100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      // 2. Pin drops with bounce
      this.timeline.from('.demo-pin', {
        y: -40,
        opacity: 0,
        duration: 0.5,
        ease: 'bounce.out'
      }, '-=0.2');

      // 3. Weather panel slides in from right
      this.timeline.from('.demo-weather-panel', {
        x: 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.3');

      // 4. Temperature value reveal
      this.timeline.from('.demo-temp-value', {
        scale: 0.5,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
      }, '-=0.4');

      // 5. Alert badge appears with scale
      this.timeline.to('.demo-alert-badge', {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(2)'
      }, '-=0.2');

      // 6. Shake effect on the badge
      this.timeline.to('.demo-alert-badge', {
        x: 4,
        duration: 0.05,
        repeat: 6,
        yoyo: true,
        ease: 'none'
      });

      // 7. Alert card slides in from bottom
      this.timeline.from('.demo-alert-card', {
        y: 60,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.2');

      // Decorative elements animation
      gsap.from('.demo-rings .ring', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '#alert-demo',
          start: 'top 50%',
          toggleActions: 'play none none reverse'
        }
      });

    }, this.el.nativeElement);
  }

  private animateTemperature(): void {
    const tempElement = this.el.nativeElement.querySelector('.demo-temp-value');
    if (tempElement) {
      const tempObj = { val: 15 };

      gsap.to(tempObj, {
        val: 1.2,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          tempElement.textContent = tempObj.val.toFixed(1) + '°C';
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.ctx) {
      this.ctx.revert();
    }

    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }

    if (this.timeline) {
      this.timeline.kill();
    }
  }
}
