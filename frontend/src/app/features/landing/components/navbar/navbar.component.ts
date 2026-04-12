import {
  Component,
  HostListener,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewEncapsulation,
  NgZone
} from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  isScrolled = false;
  mobileMenuOpen = false;
  private ctx!: gsap.Context;

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Entrance animations removed to prevent visibility bugs
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > 50;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  ngOnDestroy(): void {
    if (this.ctx) {
      this.ctx.revert();
    }
  }
}
