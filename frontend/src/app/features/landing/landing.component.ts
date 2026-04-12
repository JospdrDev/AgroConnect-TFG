import { Component, AfterViewInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { HeroComponent } from './sections/hero/hero.component';
import { ServicesComponent } from './sections/services/services.component';
import { HowItWorksComponent } from './sections/how-it-works/how-it-works.component';
import { StatsComponent } from './sections/stats/stats.component';
import { AlertDemoComponent } from './sections/alert-demo/alert-demo.component';
import { TestimonialsComponent } from './sections/testimonials/testimonials.component';
import { CtaComponent } from './sections/cta/cta.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    HeroComponent,
    ServicesComponent,
    HowItWorksComponent,
    StatsComponent,
    AlertDemoComponent,
    TestimonialsComponent,
    CtaComponent,
    NavbarComponent
  ]
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private ctx!: gsap.Context;

  // Referencias a renderers y animaciones de componentes hijos
  private threeRenderers: Set<{
    renderer?: { dispose: () => void };
    scene?: { clear: () => void };
    animationId?: number;
  }> = new Set();

  ngAfterViewInit(): void {
    // Crear contexto GSAP scoped al componente
    this.ctx = gsap.context(() => {
      // Animaciones globales de la landing page
      this.initGlobalAnimations();
    }, this.el.nativeElement);

    // Refresh de ScrollTrigger después de que Angular renderice el DOM
    // Usar timeout para asegurar que todos los componentes hijos están renderizados
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Refresh adicional después de cargar imágenes/assets
    window.addEventListener('load', this.handleWindowLoad);
  }

  private initGlobalAnimations(): void {
    // Animación de entrada para el header/navegación si existe
    gsap.from('.landing-header', {
      y: -20,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    // Animación entre secciones - fade suave
    gsap.utils.toArray<HTMLElement>('.landing-section').forEach((section) => {
      gsap.from(section, {
        opacity: 0.8,
        y: 20,
        duration: 0.6,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  private handleWindowLoad = (): void => {
    ScrollTrigger.refresh();
  };

  /**
   * Registra un renderer de Three.js para limpieza posterior
   */
  registerThreeRenderer(renderer: {
    renderer?: { dispose: () => void };
    scene?: { clear: () => void };
    animationId?: number;
  }): void {
    this.threeRenderers.add(renderer);
  }

  /**
   * Elimina un renderer de Three.js del registro
   */
  unregisterThreeRenderer(renderer: {
    renderer?: { dispose: () => void };
    scene?: { clear: () => void };
    animationId?: number;
  }): void {
    this.threeRenderers.delete(renderer);
  }

  ngOnDestroy(): void {
    // 1. Revertir contexto GSAP (mata todas las animaciones scoped)
    if (this.ctx) {
      this.ctx.revert();
    }

    // 2. Limpiar todos los ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // 3. Limpiar renderers de Three.js registrados
    this.threeRenderers.forEach(({ renderer, scene, animationId }) => {
      // Cancelar requestAnimationFrame
      if (animationId !== undefined) {
        cancelAnimationFrame(animationId);
      }

      // Limpiar escena
      if (scene?.clear) {
        scene.clear();
      }

      // Disponer renderer
      if (renderer?.dispose) {
        renderer.dispose();
      }
    });
    this.threeRenderers.clear();

    // 4. Limpiar event listeners globales
    window.removeEventListener('load', this.handleWindowLoad);

    // 5. Forzar garbage collection del renderer (si está disponible)
    if (typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc();
    }
  }
}
