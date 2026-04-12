import { Component, AfterViewInit, OnDestroy, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Dynamic import type
type THREEType = typeof import('three');

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.scss']
})
export class CtaComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private ctx!: gsap.Context;

  @ViewChild('grassCanvas', { static: false }) grassCanvasRef!: ElementRef<HTMLCanvasElement>;

  private THREE!: THREEType;
  private renderer!: import('three').WebGLRenderer;
  private scene!: import('three').Scene;
  private camera!: import('three').Camera;
  private grassMaterial!: import('three').ShaderMaterial;
  private animFrameId!: number;
  private isActive = true;
  private resizeHandler!: () => void;

  async ngAfterViewInit(): Promise<void> {
    // Dynamic import of Three.js
    this.THREE = await import('three');

    this.ctx = gsap.context(() => {
      this.initGSAPAnimations();
      this.initGrassScene();
    }, this.el.nativeElement);
  }

  private initGSAPAnimations(): void {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#cta',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.from('.cta-eyebrow', { y: 20, opacity: 0, duration: 0.6 })
      .from('.cta-title', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .from('.cta-subtitle', { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
      .from('.cta-buttons', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.cta-canvas', { opacity: 0, duration: 1.2 }, '-=0.8');
  }

  private initGrassScene(): void {
    if (!this.grassCanvasRef?.nativeElement || !this.THREE) return;

    const canvas = this.grassCanvasRef.nativeElement;
    const THREE = this.THREE;

    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    this.camera.position.set(0, 2, 5);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Grass shader
    const grassVertexShader = `
      varying vec2 vUv;
      varying float vHeight;
      uniform float uTime;

      void main() {
        vUv = uv;
        vHeight = position.y;

        vec3 pos = position;

        // Wind effect - only on top vertices
        float wind = sin(uTime * 2.0 + position.x * 3.0) * 0.15;
        wind += sin(uTime * 1.5 + position.z * 2.0) * 0.1;
        pos.x += wind * (position.y / 1.0);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const grassFragmentShader = `
      varying vec2 vUv;
      varying float vHeight;

      void main() {
        // Gradient from dark green bottom to light green top
        vec3 bottomColor = vec3(0.18, 0.35, 0.16);
        vec3 topColor = vec3(0.55, 0.77, 0.29);
        vec3 color = mix(bottomColor, topColor, vHeight);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    this.grassMaterial = new THREE.ShaderMaterial({
      vertexShader: grassVertexShader,
      fragmentShader: grassFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      }
    });

    // Create instanced grass blades
    const bladeGeometry = new THREE.PlaneGeometry(0.05, 0.8, 1, 4);
    bladeGeometry.translate(0, 0.4, 0);

    const instanceCount = 3000;
    const grassMesh = new THREE.InstancedMesh(bladeGeometry, this.grassMaterial, instanceCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < instanceCount; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 15,
        0,
        (Math.random() - 0.5) * 8
      );
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.x = (Math.random() - 0.5) * 0.2;
      dummy.scale.setScalar(0.8 + Math.random() * 0.4);
      dummy.updateMatrix();
      grassMesh.setMatrixAt(i, dummy.matrix);
    }

    grassMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(grassMesh);

    // Store reference for cleanup
    const grassMeshRef = grassMesh;

    // Animation loop
    const animate = () => {
      if (!this.isActive) return;

      this.grassMaterial.uniforms['uTime'].value += 0.016;
      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize with stored reference
    this.resizeHandler = () => {
      if (!canvas.parentElement || !this.camera || !this.renderer) return;
      const width = canvas.parentElement.offsetWidth;
      const height = canvas.parentElement.offsetHeight * 0.4;
      this.renderer.setSize(width, height);
      (this.camera as import('three').PerspectiveCamera).aspect = width / height;
      (this.camera as import('three').PerspectiveCamera).updateProjectionMatrix();
    };

    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  }

  ngOnDestroy(): void {
    this.isActive = false;

    // Clean up GSAP context
    if (this.ctx) {
      this.ctx.revert();
    }

    // Remove resize listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    // Cancel animation frame
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    // Dispose Three.js resources in correct order
    if (this.scene) {
      // Dispose all geometries and materials in the scene
      this.scene.traverse((object) => {
        if ((object as any).geometry) {
          (object as any).geometry.dispose();
        }
        if ((object as any).material) {
          if (Array.isArray((object as any).material)) {
            (object as any).material.forEach((m: any) => m.dispose());
          } else {
            (object as any).material.dispose();
          }
        }
      });
      this.scene.clear();
    }

    if (this.grassMaterial) {
      this.grassMaterial.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      // Force context loss for WebGL cleanup
      const gl = this.renderer.getContext();
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }
  }
}
