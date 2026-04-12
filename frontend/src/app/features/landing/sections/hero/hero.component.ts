import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Dynamic import type
type THREEType = typeof import('three');

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  standalone: true
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas', { static: true }) heroCanvas!: ElementRef<HTMLCanvasElement>;

  private THREE!: THREEType;
  private scene!: import('three').Scene;
  private camera!: import('three').PerspectiveCamera;
  private renderer!: import('three').WebGLRenderer;
  private terrain!: import('three').Mesh;
  private particles!: import('three').Points;
  private trees!: import('three').InstancedMesh;
  private clock!: import('three').Clock;
  private animFrameId!: number;
  private ctx!: gsap.Context;
  private scrollTriggerInstance!: ScrollTrigger;

  // Shader material for animated terrain
  private terrainMaterial!: import('three').ShaderMaterial;

  // Event handlers stored for cleanup
  private resizeHandler!: () => void;

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  async ngAfterViewInit(): Promise<void> {
    // Dynamic import of Three.js
    this.THREE = await import('three');
    this.clock = new this.THREE.Clock();

    this.ngZone.runOutsideAngular(() => {
      this.initThreeJS();
      this.initHeroAnimations();
      this.animate();
    });
  }

  private initThreeJS(): void {
    if (!this.THREE) return;

    const THREE = this.THREE;
    const canvas = this.heroCanvas.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a1108');
    this.scene.fog = new THREE.Fog('#0a1108', 80, 200);

    // Camera - starts aerial view
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 120, 0);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    const ambientLight = new THREE.AmbientLight('#8BC34A', 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight('#ffeb3b', 1.2);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Create terrain with custom shader
    this.createTerrain();

    // Create instanced trees
    this.createTrees();

    // Create floating particles
    this.createParticles();

    // Store handler reference for cleanup
    this.resizeHandler = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeHandler);
  }

  private createTerrain(): void {
    if (!this.THREE) return;
    const THREE = this.THREE;

    const geometry = new THREE.PlaneGeometry(400, 400, 150, 150);

    // Custom shader material for rolling hills
    this.terrainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#4CAF50') },
        uColor2: { value: new THREE.Color('#2E7D32') }
      },
      vertexShader: `
        uniform float uTime;
        varying float vElevation;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Create rolling hills with sin/cos waves
          float elevation = sin(pos.x * 0.05 + uTime * 0.3) * 3.0;
          elevation += cos(pos.y * 0.03 + uTime * 0.2) * 2.0;
          elevation += sin(pos.x * 0.1 + pos.y * 0.1) * 1.5;
          elevation += cos(pos.x * 0.07) * sin(pos.y * 0.07) * 2.0;

          pos.z += elevation;
          vElevation = elevation;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying float vElevation;
        varying vec2 vUv;

        void main() {
          // Mix colors based on elevation
          float mixStrength = (vElevation + 6.0) / 12.0;
          vec3 color = mix(uColor1, uColor2, mixStrength);

          // Add subtle gradient based on UV
          color = mix(color, uColor2 * 0.8, vUv.y * 0.3);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    this.terrain = new THREE.Mesh(geometry, this.terrainMaterial);
    this.terrain.rotation.x = -Math.PI / 2;
    this.terrain.position.y = -10;
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);
  }

  private createTrees(): void {
    if (!this.THREE) return;
    const THREE = this.THREE;

    // Tree geometry: cone for foliage
    const treeGeometry = new THREE.CylinderGeometry(0, 1.2, 3, 6);
    treeGeometry.translate(0, 1.5, 0);

    const treeMaterial = new THREE.MeshStandardMaterial({
      color: '#2E7D32',
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true
    });

    // Create 300 instanced trees
    const count = 300;
    this.trees = new THREE.InstancedMesh(treeGeometry, treeMaterial, count);
    this.trees.castShadow = true;
    this.trees.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const colors = [
      new THREE.Color('#1B5E20'),
      new THREE.Color('#2E7D32'),
      new THREE.Color('#388E3C'),
      new THREE.Color('#43A047')
    ];

    for (let i = 0; i < count; i++) {
      // Random position across the terrain
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;

      // Skip center area (where text is)
      if (Math.abs(x) < 30 && Math.abs(z) < 30) {
        dummy.position.set(0, -1000, 0); // Hide unused instances
      } else {
        // Calculate height at this position (approximate)
        const y = Math.sin(x * 0.05) * 3.0 + Math.cos(z * 0.03) * 2.0;

        dummy.position.set(x, y - 8, z);

        // Random scale variation
        const scale = 0.8 + Math.random() * 0.6;
        dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);

        // Random rotation
        dummy.rotation.y = Math.random() * Math.PI * 2;

        // Color variation
        this.trees.setColorAt(i, colors[Math.floor(Math.random() * colors.length)]);
      }

      dummy.updateMatrix();
      this.trees.setMatrixAt(i, dummy.matrix);
    }

    this.trees.instanceMatrix.needsUpdate = true;
    this.scene.add(this.trees);
  }

  private createParticles(): void {
    if (!this.THREE) return;
    const THREE = this.THREE;

    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;     // x
      positions[i * 3 + 1] = Math.random() * 60;           // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
      speeds[i] = 0.02 + Math.random() * 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    const material = new THREE.PointsMaterial({
      color: '#DCEDC8',
      size: 0.4,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private animateParticles(): void {
    if (!this.particles) return;

    const positions = this.particles.geometry.attributes['position'].array as Float32Array;
    const speeds = this.particles.geometry.attributes['speed'].array as Float32Array;

    for (let i = 0; i < positions.length / 3; i++) {
      // Move particles upward
      positions[i * 3 + 1] += speeds[i];

      // Reset if too high
      if (positions[i * 3 + 1] > 60) {
        positions[i * 3 + 1] = 0;
      }

      // Slight horizontal drift
      positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.02;
    }

    this.particles.geometry.attributes['position'].needsUpdate = true;
  }

  private initHeroAnimations(): void {
    this.ctx = gsap.context(() => {
      // Hero entrance timeline - Left aligned animations
      const entranceTl = gsap.timeline({ delay: 0.3 });

      entranceTl
        .from('.hero-badge', {
          x: -40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        })
        .from('.hero-title .word', {
          x: -40,
          opacity: 0,
          stagger: 0.15,
          duration: 1,
          ease: 'power4.out'
        }, '-=0.4')
        .from('.hero-subtitle', {
          x: -40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.6')
        .from('.hero-cta-group', {
          x: -40,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out'
        }, '-=0.5')
        .from('.hero-stats', {
          x: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.8')
        .from('.stat-item', {
          x: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: 'power3.out'
        }, '-=0.6')
        .from('.hero-scroll-hint', {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out'
        }, '-=0.3');

      // ScrollTrigger: camera transition aerial -> eye-level
      this.scrollTriggerInstance = ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        onUpdate: (self) => {
          if (this.camera) {
            // Interpolate camera position
            const progress = self.progress;
            this.camera.position.y = gsap.utils.interpolate(120, 30, progress);
            this.camera.position.z = gsap.utils.interpolate(0, 80, progress);
            this.camera.lookAt(0, 0, 0);
          }
        }
      });

      // Animate stats counters on enter
      ScrollTrigger.create({
        trigger: '.hero-stats',
        start: 'top 80%',
        once: true,
        onEnter: () => this.animateCounters()
      });

    }, this.el.nativeElement);
  }

  private animateCounters(): void {
    const counters = [
      { el: '.stat-item:nth-child(1) .stat-number', end: 2400, prefix: '+' },
      { el: '.stat-item:nth-child(2) .stat-number', end: 98, suffix: '%' },
      { el: '.stat-item:nth-child(3) .stat-number', end: 18000, prefix: '+' }
    ];

    counters.forEach(({ el, end, prefix = '', suffix = '' }) => {
      const element = this.el.nativeElement.querySelector(el);
      if (element) {
        gsap.to({ val: 0 }, {
          val: end,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function(this: any) {
            const val = Math.round((this as any).targets()[0].val);
            element.textContent = prefix + val.toLocaleString('es-ES') + suffix;
          }
        });
      }
    });
  }

  private animate(): void {
    this.animFrameId = requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    // Update terrain shader time
    if (this.terrainMaterial) {
      this.terrainMaterial.uniforms['uTime'].value += delta;
    }

    // Animate particles
    this.animateParticles();

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  ngOnDestroy(): void {
    // Clean up GSAP
    if (this.ctx) {
      this.ctx.revert();
    }

    // Kill ScrollTrigger instances
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }

    // Cancel animation frame
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    // Remove event listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    // Dispose Three.js resources in correct order
    if (this.scene) {
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

    if (this.terrainMaterial) {
      this.terrainMaterial.dispose();
    }

    if (this.trees) {
      this.trees.geometry.dispose();
      (this.trees.material as any).dispose();
    }

    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as any).dispose();
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
