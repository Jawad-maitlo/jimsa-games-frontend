import * as THREE from "three";

export interface ArticulatedAvatar {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  body: THREE.Mesh;
  ring: THREE.Mesh;
  setEliminated: (eliminated: boolean) => void;
  animateWalk: (speed: number, time: number) => void;
}

export function createNameplateSprite(name: string, playerNumber: string, isMe: boolean): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 68;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = isMe ? "rgba(15, 118, 110, 0.92)" : "rgba(15, 23, 42, 0.82)";
  ctx.beginPath();
  ctx.roundRect(8, 10, 284, 48, 14);
  ctx.fill();
  ctx.strokeStyle = isMe ? "#5EEAD4" : "#94A3B8";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = name.length > 11 ? name.slice(0, 10) + "…" : name;
  ctx.fillText(`#${playerNumber} ${label}${isMe ? " ★" : ""}`, 150, 35);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.4, 0.78, 1);
  sprite.position.set(0, 3.15, 0);
  return sprite;
}

function createNumberPatchTexture(numStr: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, 128, 64);
  ctx.strokeStyle = "#0F766E";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 124, 60);
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 40px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(numStr, 64, 35);
  return new THREE.CanvasTexture(canvas);
}

// Teal-Green Numbered Tracksuit Player matching reference images
export function createArticulatedAvatar(
  _colorHex: string,
  displayName: string,
  isMe: boolean,
  playerIndex = 0
): ArticulatedAvatar {
  const group = new THREE.Group();
  const iconicNums = ["456", "067", "218", "001", "199", "101", "240", "069", "322"];
  const playerNumber = iconicNums[playerIndex % iconicNums.length];

  const tracksuitMat = new THREE.MeshStandardMaterial({
    color: 0x0f766e, // Iconic teal-green tracksuit
    roughness: 0.65,
    metalness: 0.05,
  });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe6b89c, roughness: 0.65 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });

  // Legs (Teal pants + white sneakers)
  const legGeo = new THREE.CapsuleGeometry(0.16, 0.56, 6, 10);
  const leftLeg = new THREE.Mesh(legGeo, tracksuitMat);
  leftLeg.position.set(-0.2, 0.48, 0);
  leftLeg.castShadow = true;
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.38), whiteMat);
  leftShoe.position.set(0, -0.38, 0.06);
  leftLeg.add(leftShoe);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, tracksuitMat);
  rightLeg.position.set(0.2, 0.48, 0);
  rightLeg.castShadow = true;
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.38), whiteMat);
  rightShoe.position.set(0, -0.38, 0.06);
  rightLeg.add(rightShoe);
  group.add(rightLeg);

  // Torso (Teal tracksuit jacket + white undershirt + chest & back number patches)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.92, 0.44), tracksuitMat);
  body.position.set(0, 1.32, 0);
  body.castShadow = true;
  group.add(body);

  const shirtStripe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.88, 0.46), whiteMat);
  shirtStripe.position.set(0, 0.02, 0);
  body.add(shirtStripe);

  const patchTex = createNumberPatchTexture(playerNumber);
  const patchMat = new THREE.MeshBasicMaterial({ map: patchTex });
  const frontPatch = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.24), patchMat);
  frontPatch.position.set(0, 0.12, 0.24);
  body.add(frontPatch);

  const backPatch = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.25), patchMat);
  backPatch.position.set(0, 0.12, -0.23);
  backPatch.rotation.y = Math.PI;
  body.add(backPatch);

  // Arms with white tracksuit stripes
  const armGeo = new THREE.CapsuleGeometry(0.13, 0.54, 6, 10);
  const leftArm = new THREE.Mesh(armGeo, tracksuitMat);
  leftArm.position.set(-0.52, 1.32, 0);
  leftArm.castShadow = true;
  const lStripe = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.56, 0.08), whiteMat);
  lStripe.position.set(-0.12, 0, 0);
  leftArm.add(lStripe);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, tracksuitMat);
  rightArm.position.set(0.52, 1.32, 0);
  rightArm.castShadow = true;
  const rStripe = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.56, 0.08), whiteMat);
  rStripe.position.set(0.12, 0, 0);
  rightArm.add(rStripe);
  group.add(rightArm);

  // Head + Hair
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 16), skinMat);
  head.position.set(0, 2.12, 0);
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.325, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hair.position.set(0, 2.16, -0.02);
  group.add(hair);

  // Ground indicator ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.52, 0.68, 24),
    new THREE.MeshBasicMaterial({
      color: isMe ? 0x10b981 : 0xf8fafc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isMe ? 0.9 : 0.35,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  group.add(createNameplateSprite(displayName, playerNumber, isMe));

  let isElim = false;
  return {
    group,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    body,
    ring,
    setEliminated(eliminated: boolean) {
      if (isElim === eliminated) return;
      isElim = eliminated;
      if (eliminated) {
        tracksuitMat.color.setHex(0x7f1d1d);
        group.rotation.x = -Math.PI / 2;
        group.position.y = 0.24;
      } else {
        tracksuitMat.color.setHex(0x0f766e);
        group.rotation.x = 0;
        group.position.y = 0;
      }
    },
    animateWalk(speed: number, time: number) {
      if (isElim) return;
      const swing = Math.min(1, speed * 5) * Math.sin(time * 15) * 0.8;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      leftArm.rotation.x = -swing * 0.9;
      rightArm.rotation.x = swing * 0.9;
      body.position.y = 1.32 + Math.abs(Math.sin(time * 15)) * Math.min(0.12, speed * 0.4);
    },
  };
}

// Pink Masked Soldier (Circle / Triangle / Square)
function createMaskSymbolTexture(shape: "circle" | "triangle" | "square"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0F111A";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 10;

  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(64, 64, 34, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(64, 24);
    ctx.lineTo(102, 96);
    ctx.lineTo(26, 96);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.strokeRect(30, 30, 68, 68);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createPinkGuard(shape: "circle" | "triangle" | "square" = "triangle"): THREE.Group {
  const g = new THREE.Group();
  const pinkSuit = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.55 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.3 });

  // Legs
  [-0.2, 0.2].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.62, 6, 10), pinkSuit);
    leg.position.set(lx, 0.5, 0);
    leg.castShadow = true;
    g.add(leg);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.34), blackMat);
    boot.position.set(lx, 0.11, 0.04);
    g.add(boot);
  });

  // Torso + Black Tactical Belt
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.96, 0.42), pinkSuit);
  torso.position.set(0, 1.38, 0);
  torso.castShadow = true;
  g.add(torso);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 0.46), blackMat);
  belt.position.set(0, 1.02, 0);
  g.add(belt);

  // Arms
  [-0.5, 0.5].forEach((ax) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.56, 6, 10), pinkSuit);
    arm.position.set(ax, 1.36, 0.08);
    arm.rotation.x = -0.3;
    arm.castShadow = true;
    g.add(arm);
  });

  // Pink Hood + Black Geometric Mask
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), pinkSuit);
  hood.position.set(0, 2.18, 0);
  hood.castShadow = true;
  g.add(hood);

  const maskTex = createMaskSymbolTexture(shape);
  const maskPlane = new THREE.Mesh(
    new THREE.CircleGeometry(0.29, 20),
    new THREE.MeshBasicMaterial({ map: maskTex })
  );
  maskPlane.position.set(0, 2.18, 0.33);
  g.add(maskPlane);

  // Dark Prop Rifle held across chest
  const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 1.25), blackMat);
  rifle.position.set(0.22, 1.28, 0.42);
  rifle.rotation.y = -0.45;
  rifle.rotation.x = 0.2;
  g.add(rifle);

  return g;
}

// Giant Animatronic Doll (Young-hee inspired, matching uploaded images!)
export function createGiantDoll(): {
  group: THREE.Group;
  headGroup: THREE.Group;
  eyeMat: THREE.MeshBasicMaterial;
  laserCone: THREE.Mesh;
} {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3d6b6, roughness: 0.45 });
  const yellowShirt = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
  const orangeDress = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.55 });
  const whiteSocks = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
  const blackShoes = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.75 });

  // Legs + White Knee-High Socks + Black Shoes
  [-1.05, 1.05].forEach((lx) => {
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.65, 1.85), blackShoes);
    shoe.position.set(lx, 0.33, 0.25);
    shoe.castShadow = true;
    group.add(shoe);

    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.48, 2.8, 16), whiteSocks);
    sock.position.set(lx, 2.0, 0);
    sock.castShadow = true;
    group.add(sock);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.55, 1.6, 16), skinMat);
    thigh.position.set(lx, 4.0, 0);
    group.add(thigh);
  });

  // Orange Pinafore Dress
  const dressSkirt = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.75, 4.3, 20), orangeDress);
  dressSkirt.position.set(0, 6.5, 0);
  dressSkirt.castShadow = true;
  group.add(dressSkirt);

  // Yellow Shirt Upper Torso + Orange Dress Straps
  const upperTorso = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, 2.2, 18), yellowShirt);
  upperTorso.position.set(0, 9.6, 0);
  upperTorso.castShadow = true;
  group.add(upperTorso);

  const bib = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 2.8), orangeDress);
  bib.position.set(0, 9.2, 0.15);
  group.add(bib);

  // Jointed Arms + Yellow Sleeves
  [-2.25, 2.25].forEach((ax) => {
    const sleeve = new THREE.Mesh(new THREE.SphereGeometry(0.88, 14, 14), yellowShirt);
    sleeve.position.set(ax * 0.85, 10.1, 0);
    group.add(sleeve);

    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 3.6, 8, 12), skinMat);
    arm.position.set(ax, 7.6, 0);
    arm.rotation.z = ax < 0 ? -0.14 : 0.14;
    arm.castShadow = true;
    group.add(arm);
  });

  // Rotating Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 12.2, 0);

  const head = new THREE.Mesh(new THREE.SphereGeometry(1.78, 24, 24), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Black Bob Hair + Two Pigtails + Purple Hair Clips
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(1.88, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat
  );
  hairCap.position.set(0, 0.18, -0.08);
  headGroup.add(hairCap);

  [-1.75, 1.75].forEach((px) => {
    const pigtail = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 14), hairMat);
    pigtail.position.set(px, -0.75, -0.35);
    headGroup.add(pigtail);
  });

  // Doll Face: Eyes (glow red when scanning!) + Rosy Cheeks + Lips
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

  [-0.58, 0.58].forEach((ex) => {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), eyeWhiteMat);
    sclera.position.set(ex, 0.12, 1.56);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), eyeMat);
    pupil.position.set(ex, 0.12, 1.72);
    headGroup.add(sclera, pupil);
  });

  const mouth = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xbe123c })
  );
  mouth.scale.set(1.4, 0.55, 0.5);
  mouth.position.set(0, -0.68, 1.66);
  headGroup.add(mouth);

  // Red Motion-Scanner Beam Cone (active only on RED)
  const laserCone = new THREE.Mesh(
    new THREE.ConeGeometry(16, 105, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  laserCone.rotation.x = -Math.PI / 2;
  laserCone.position.set(0, -1.5, 53);
  laserCone.visible = false;
  headGroup.add(laserCone);

  group.add(headGroup);

  return { group, headGroup, eyeMat, laserCone };
}

// Procedural Sandy Playground Ground Texture
export function createSandGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#DECBA8";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle =
      Math.random() > 0.5 ? "rgba(180, 148, 104, 0.24)" : "rgba(255, 248, 231, 0.25)";
    ctx.fillRect(x, y, 2.5, 2.5);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 28);
  return tex;
}

// Procedural Painted Sky-Blue & Golden Wheat Meadow Mural Wall Texture (matching image_41db1b.png)
export function createMeadowWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Painted blue daytime sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 185);
  skyGrad.addColorStop(0, "#4BA3C7");
  skyGrad.addColorStop(0.65, "#87CEEB");
  skyGrad.addColorStop(1, "#D8EEF5");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 256);

  // Soft painted clouds
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.ellipse(60 + i * 85, 55 + (i % 2) * 24, 52, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Painted Golden Wheat / Grass Field along the bottom
  const wheatGrad = ctx.createLinearGradient(0, 172, 0, 256);
  wheatGrad.addColorStop(0, "#D4AF37");
  wheatGrad.addColorStop(0.45, "#C29B48");
  wheatGrad.addColorStop(1, "#9E7A38");
  ctx.fillStyle = wheatGrad;
  ctx.fillRect(0, 172, 512, 84);

  // Painted wheat stalks
  ctx.strokeStyle = "rgba(130, 92, 30, 0.45)";
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 256);
    ctx.lineTo(x + (Math.random() - 0.5) * 8, 168 + Math.random() * 14);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(6, 1);
  return tex;
}
