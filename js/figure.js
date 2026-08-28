/* =========================================================================
   SHEROES – Omino 3D stilizzato (Three.js)
   Nota: animazioni schematiche per archetipo di movimento, non riproduzioni
   biomeccaniche esatte di ogni singolo esercizio.
   ========================================================================= */

class StickFigure {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.currentAnim = "rest";
    this.perSide = false;
    this._sideFlip = 1;

    this._initScene();
    this._buildRig();
    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);
    window.addEventListener("resize", () => this._onResize());
  }

  _initScene() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    this.camera.position.set(0, 1.7, 6.2);
    this.camera.lookAt(0, 1.0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);
    const key = new THREE.PointLight(0xff3d6e, 1.1, 20);
    key.position.set(2.5, 4, 3);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x2de1c2, 0.8, 20);
    rim.position.set(-3, 2, -2);
    this.scene.add(rim);

    // subtle ground ring
    const ringGeo = new THREE.RingGeometry(1.15, 1.25, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3d6e, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.scene.add(ring);
  }

  _limbMat() {
    return new THREE.MeshStandardMaterial({
      color: 0xf5f3f0,
      emissive: 0xff3d6e,
      emissiveIntensity: 0.12,
      roughness: 0.35,
      metalness: 0.1
    });
  }

  _joint() {
    const geo = new THREE.SphereGeometry(0.075, 16, 16);
    return new THREE.Mesh(geo, this._limbMat());
  }

  _bone(length, radius = 0.055) {
    const geo = new THREE.CylinderGeometry(radius, radius, length, 12);
    const mesh = new THREE.Mesh(geo, this._limbMat());
    mesh.position.y = -length / 2;
    return mesh;
  }

  _buildRig() {
    const root = new THREE.Group(); // hips, moves whole body up/down
    root.position.y = 1.0;
    this.scene.add(root);
    this.root = root;

    // Torso (pivots at hips)
    const torsoPivot = new THREE.Group();
    root.add(torsoPivot);
    this.torsoPivot = torsoPivot;

    const torsoLen = 0.62;
    const torso = this._bone(torsoLen, 0.11);
    torsoPivot.add(torso);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.y = -torsoLen;
    torsoPivot.add(headGroup);
    this.headGroup = headGroup;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), this._limbMat());
    head.position.y = -0.2;
    headGroup.add(head);

    // Shoulders
    const shoulderY = -0.08;
    this.shoulderL = new THREE.Group();
    this.shoulderL.position.set(0.16, shoulderY, 0);
    torsoPivot.add(this.shoulderL);
    this.shoulderR = new THREE.Group();
    this.shoulderR.position.set(-0.16, shoulderY, 0);
    torsoPivot.add(this.shoulderR);

    const upperArmLen = 0.32, lowerArmLen = 0.3;
    this.elbowL = this._makeLimbChain(this.shoulderL, upperArmLen, lowerArmLen, 0.045);
    this.elbowR = this._makeLimbChain(this.shoulderR, upperArmLen, lowerArmLen, 0.045);

    // Hips (legs)
    const hipY = 0;
    this.hipL = new THREE.Group();
    this.hipL.position.set(0.1, hipY, 0);
    root.add(this.hipL);
    this.hipR = new THREE.Group();
    this.hipR.position.set(-0.1, hipY, 0);
    root.add(this.hipR);

    const upperLegLen = 0.42, lowerLegLen = 0.42;
    this.kneeL = this._makeLimbChain(this.hipL, upperLegLen, lowerLegLen, 0.06);
    this.kneeR = this._makeLimbChain(this.hipR, upperLegLen, lowerLegLen, 0.06);
  }

  // Builds pivotA -> bone -> pivotB(joint) -> bone2, returns pivotB (elbow/knee group)
  _makeLimbChain(pivotA, len1, len2, radius) {
    const bone1 = this._bone(len1, radius);
    pivotA.add(bone1);
    const jointGroup = new THREE.Group();
    jointGroup.position.y = -len1;
    pivotA.add(jointGroup);
    const jointMesh = this._joint();
    jointGroup.add(jointMesh);
    const bone2 = this._bone(len2, radius * 0.85);
    jointGroup.add(bone2);
    return jointGroup;
  }

  _onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  setAnimation(key, opts = {}) {
    this.currentAnim = key || "rest";
    this.perSide = !!opts.perSide;
    this.clock.start();
  }

  _animate() {
    requestAnimationFrame(this._animate);
    const t = this.clock.getElapsedTime();
    const cycle = 1.6; // seconds per movement cycle
    let p = (t % cycle) / cycle; // 0..1

    // flip which side leads every full cycle set, for perSide exercises
    if (this.perSide) {
      const cycleIndex = Math.floor(t / cycle);
      this._sideFlip = cycleIndex % 2 === 0 ? 1 : -1;
    } else {
      this._sideFlip = 1;
    }

    const pose = POSES[this.currentAnim] ? POSES[this.currentAnim](p, this._sideFlip) : POSES.rest(p, 1);
    this._applyPose(pose);

    this.renderer.render(this.scene, this.camera);
  }

  _applyPose(pose) {
    this.root.position.y = 1.0 + (pose.rootY || 0);
    this.torsoPivot.rotation.x = pose.torsoTilt || 0;
    this.headGroup.rotation.x = pose.headTilt || 0;

    this.shoulderL.rotation.x = pose.armL || 0;
    this.shoulderR.rotation.x = pose.armR || 0;
    this.shoulderL.rotation.z = pose.armLOut || 0;
    this.shoulderR.rotation.z = -(pose.armROut || 0);
    this.elbowL.rotation.x = pose.elbowL || 0;
    this.elbowR.rotation.x = pose.elbowR || 0;

    this.hipL.rotation.x = pose.legL || 0;
    this.hipR.rotation.x = pose.legR || 0;
    this.hipL.rotation.z = pose.legLOut || 0;
    this.hipR.rotation.z = -(pose.legROut || 0);
    this.kneeL.rotation.x = pose.kneeL || 0;
    this.kneeR.rotation.x = pose.kneeR || 0;
  }
}

// ---- Helper easing ----
const ease = (p) => (1 - Math.cos(p * Math.PI * 2)) / 2; // smooth 0->1->0 wave
const triangle = (p) => (p < 0.5 ? p * 2 : 2 - p * 2); // 0->1->0 linear

/* Each pose function: (p in [0,1), sideFlip -1|1) -> pose object in radians / meters */
const POSES = {
  rest: (p) => ({ rootY: Math.sin(p * Math.PI * 2) * 0.01 }),

  jump: (p) => {
    const bounce = Math.abs(Math.sin(p * Math.PI * 2));
    return {
      rootY: bounce * 0.12,
      armL: -bounce * 1.1,
      armR: -bounce * 1.1,
      armLOut: bounce * 0.6,
      armROut: bounce * 0.6,
      legLOut: bounce * 0.35,
      legROut: bounce * 0.35,
      kneeL: bounce * 0.3,
      kneeR: bounce * 0.3
    };
  },

  plank_flow: (p) => {
    // oscillate between plank (flat) and down-dog (hips high)
    const e = ease(p);
    return {
      rootY: -0.32,
      torsoTilt: -1.35 + e * 0.55, // pitched forward, hips rise with e
      headTilt: 0.3 - e * 0.2,
      armL: -1.4,
      armR: -1.4,
      legL: 0.15 - e * 0.4,
      legR: 0.15 - e * 0.4,
      kneeL: 0.05,
      kneeR: 0.05
    };
  },

  hinge: (p) => {
    const e = ease(p);
    return {
      torsoTilt: -e * 1.15,
      headTilt: e * 0.3,
      armL: -e * 1.5,
      armR: -e * 1.5,
      legL: e * 0.12,
      legR: -e * 0.05,
      kneeL: 0.12,
      kneeR: 0.1
    };
  },

  squat: (p) => {
    const e = ease(p);
    return {
      rootY: -e * 0.38,
      torsoTilt: -e * 0.35,
      armL: -e * 0.9,
      armR: -e * 0.9,
      legLOut: 0.18,
      legROut: 0.18,
      kneeL: e * 1.3,
      kneeR: e * 1.3
    };
  },

  lunge: (p, side) => {
    const e = ease(p);
    return {
      rootY: -e * 0.3,
      torsoTilt: -e * 0.12,
      armL: side > 0 ? e * 0.7 : -e * 0.4,
      armR: side > 0 ? -e * 0.4 : e * 0.7,
      legL: side > 0 ? -e * 0.9 : e * 0.6,
      legR: side > 0 ? e * 0.6 : -e * 0.9,
      kneeL: side > 0 ? e * 0.2 : e * 1.4,
      kneeR: side > 0 ? e * 1.4 : e * 0.2
    };
  },

  core_twist: (p) => {
    const t = (triangle(p) - 0.5) * 2; // -1..1..-1
    return {
      rootY: -0.34,
      torsoTilt: -1.5,
      headTilt: 0.2,
      armL: -1.4 + t * 0.5,
      armR: -1.4 - t * 0.5,
      legL: 0.05,
      legR: 0.05,
      kneeL: 1.4,
      kneeR: 1.4
    };
  },

  pushup: (p) => {
    const e = ease(p);
    return {
      rootY: -0.34,
      torsoTilt: -1.5,
      armL: -1.5,
      armR: -1.5,
      elbowL: e * 1.4,
      elbowR: e * 1.4,
      legL: 0.1,
      legR: 0.1
    };
  },

  band_curl: (p) => {
    const e = ease(p);
    return {
      armL: -0.15,
      armR: -0.15,
      elbowL: e * 1.6,
      elbowR: e * 1.6
    };
  },

  band_row: (p) => {
    const e = ease(p);
    return {
      torsoTilt: -0.5,
      armL: -0.3 + e * 0.5,
      armR: -0.3 + e * 0.5,
      elbowL: e * 1.6,
      elbowR: e * 1.6
    };
  },

  band_press: (p) => {
    const e = ease(p);
    return {
      armL: -0.3 - e * 1.7,
      armR: -0.3 - e * 1.7,
      elbowL: (1 - e) * 1.3,
      elbowR: (1 - e) * 1.3
    };
  },

  side_hold: (p, side) => {
    return {
      rootY: -0.28,
      torsoTilt: -1.55,
      armL: side > 0 ? -1.6 : -0.2,
      armR: side > 0 ? -0.2 : -1.6,
      armLOut: side > 0 ? 0 : -1.1,
      armROut: side > 0 ? -1.1 : 0,
      legL: 0.1,
      legR: 0.1,
      kneeL: 0.05,
      kneeR: 0.05
    };
  },

  calf_raise: (p) => {
    const e = ease(p);
    return {
      rootY: e * 0.12,
      armL: -0.2,
      armR: -0.2,
      legLOut: 0.05,
      legROut: 0.05
    };
  }
};
