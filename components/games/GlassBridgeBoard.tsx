"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Timer } from "lucide-react";
import {
  ArticulatedAvatar,
  createArticulatedAvatar,
  createPinkGuard,
} from "../../lib/threeHelpers";
import { soundEngine } from "../../lib/soundEngine";

interface Props {
  state: any;
  myUserId: string;
  onAction: (action: any) => void;
}

interface GlassShard {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
}

export function GlassBridgeBoard({ state, myUserId, onAction }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  // Start dark suspenseful Glass Bridge BGM
  useEffect(() => {
    soundEngine.startBgm("bridge");
    return () => soundEngine.stopBgm();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      const s = stateRef.current;
      if (!s?.isMyTurn || s.finished) return;
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        e.preventDefault();
        soundEngine.unlock();
        onActionRef.current({ type: "step", side: "LEFT" });
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        e.preventDefault();
        soundEngine.unlock();
        onActionRef.current({ type: "step", side: "RIGHT" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const rows = stateRef.current?.rows || 8;
    const rowSpacing = 4.4;
    const bridgeMidZ = (rows * rowSpacing) / 2;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030308);
    scene.fog = new THREE.FogExp2(0x05030b, 0.014);

    const camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 9.5, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Warm Circus-Hall Chandelier Lighting
    scene.add(new THREE.HemisphereLight(0xfde68a, 0x180b1f, 0.85));
    const warmLight = new THREE.PointLight(0xffd78c, 160, 95);
    warmLight.position.set(0, 19, bridgeMidZ);
    scene.add(warmLight);
    const pinkGlow = new THREE.PointLight(0xec4899, 90, 80);
    pinkGlow.position.set(0, 6, rows * rowSpacing + 5);
    scene.add(pinkGlow);

    // Circus Canopy Overhead Crown + Draping Warm String Fairy Lights (matching image_41dabb.jpg!)
    const canopyCenter = new THREE.Vector3(0, 21, bridgeMidZ);
    const crownMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 3.0, 2.2, 16),
      new THREE.MeshStandardMaterial({
        color: 0xdb2777,
        emissive: 0x9d174d,
        emissiveIntensity: 0.75,
      })
    );
    crownMesh.position.copy(canopyCenter);
    scene.add(crownMesh);

    const goldRing = new THREE.Mesh(
      new THREE.TorusGeometry(28, 0.35, 10, 64),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.65 })
    );
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.set(0, 14, bridgeMidZ);
    scene.add(goldRing);

    const bulbGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff3c4 });
    const numStrings = 18;
    const bulbsPerString = 14;
    const totalBulbs = numStrings * bulbsPerString + 12 * 14;
    const bulbInstanced = new THREE.InstancedMesh(bulbGeo, bulbMat, totalBulbs);
    const dummy = new THREE.Object3D();
    let bIdx = 0;

    // Catenary fairy-light strings radiating from central carnival drum to outer gold ring
    for (let s = 0; s < numStrings; s++) {
      const angle = (s / numStrings) * Math.PI * 2;
      const endX = Math.cos(angle) * 28;
      const endZ = bridgeMidZ + Math.sin(angle) * 28;
      for (let k = 0; k < bulbsPerString; k++) {
        const t = k / (bulbsPerString - 1);
        const x = THREE.MathUtils.lerp(Math.cos(angle) * 3.4, endX, t);
        const z = THREE.MathUtils.lerp(bridgeMidZ + Math.sin(angle) * 3.4, endZ, t);
        const sag = Math.sin(t * Math.PI) * 3.6;
        const y = THREE.MathUtils.lerp(20.2, 14.0, t) - sag;
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        bulbInstanced.setMatrixAt(bIdx++, dummy.matrix);
      }
    }

    // Vertical wall fairy-light drop columns around the dark hall
    for (let c = 0; c < 12; c++) {
      const angle = (c / 12) * Math.PI * 2;
      const wx = Math.cos(angle) * 27.8;
      const wz = bridgeMidZ + Math.sin(angle) * 27.8;
      for (let h = 0; h < 14; h++) {
        dummy.position.set(wx, 13.5 - h * 2.1, wz);
        dummy.updateMatrix();
        bulbInstanced.setMatrixAt(bIdx++, dummy.matrix);
      }
    }
    bulbInstanced.instanceMatrix.needsUpdate = true;
    scene.add(bulbInstanced);

    // Start Platform & Theater-Curtain Finish Stage
    const startPlat = new THREE.Mesh(
      new THREE.BoxGeometry(10.5, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x1e1b2e, roughness: 0.45, metalness: 0.4 })
    );
    startPlat.position.set(0, -0.6, -4.5);
    scene.add(startPlat);

    const finishZ = rows * rowSpacing + 3.5;
    const finishPlat = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.2, 7.5),
      new THREE.MeshStandardMaterial({ color: 0x3b0764, emissive: 0x581c87, emissiveIntensity: 0.35 })
    );
    finishPlat.position.set(0, -0.6, finishZ);
    scene.add(finishPlat);

    // Velvet Red/Magenta Finish Curtain Arch
    const curtainMat = new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.8 });
    [-5.4, 5.4].forEach((cx) => {
      const drape = new THREE.Mesh(new THREE.BoxGeometry(1.5, 9, 1.2), curtainMat);
      drape.position.set(cx, 4.5, finishZ + 3.2);
      scene.add(drape);
    });
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(12.2, 1.6, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xbe123c, emissive: 0x881337, emissiveIntensity: 0.5 })
    );
    banner.position.set(0, 9.2, finishZ + 3.2);
    scene.add(banner);

    // Pink Guards watching from the Finish Stage
    [-4.0, 4.0].forEach((gx) => {
      const guard = createPinkGuard("square");
      guard.position.set(gx, 0, finishZ + 1.5);
      guard.rotation.y = Math.PI;
      scene.add(guard);
    });

    // Twin Magenta-Trimmed Metal Bridge Rails (matching image_41dabb.jpg!)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xc026d3,
      emissive: 0x701a75,
      emissiveIntensity: 0.65,
      metalness: 0.6,
    });
    [-4.5, -0.25, 0.25, 4.5].forEach((bx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, rows * rowSpacing + 2.8), railMat);
      rail.position.set(bx, -0.14, (rows * rowSpacing) / 2 - 0.8);
      scene.add(rail);
    });

    // Dark Reflective Glass Panes with Glowing White Outlines
    const tileMeshes: Record<string, THREE.Mesh> = {};
    const shatteredKeys = new Set<string>();
    const shards: GlassShard[] = [];
    const clickableTiles: THREE.Mesh[] = [];

    const borderMat = new THREE.LineBasicMaterial({ color: 0xfdf4ff });

    for (let r = 0; r < rows; r++) {
      const z = r * rowSpacing + 1.5;
      (["LEFT", "RIGHT"] as const).forEach((side) => {
        const x = side === "LEFT" ? 2.35 : -2.35;
        const geo = new THREE.BoxGeometry(3.8, 0.2, 3.5);
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0x111827,
          transparent: true,
          opacity: 0.55,
          roughness: 0.08,
          metalness: 0.25,
          emissive: 0x3b0764,
          emissiveIntensity: 0.2,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0, z);
        mesh.userData = { rowIndex: r, side };

        // Crisp glowing white border frame around each glass pane
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), borderMat);
        mesh.add(edges);

        scene.add(mesh);
        tileMeshes[`${r}_${side}`] = mesh;
        clickableTiles.push(mesh);
      });
    }

    const spawnShatter = (origin: THREE.Vector3) => {
      soundEngine.playGlassShatter();
      const shardMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.9 });
      for (let i = 0; i < 22; i++) {
        const sMesh = new THREE.Mesh(
          new THREE.TetrahedronGeometry(0.24 + Math.random() * 0.28),
          shardMat
        );
        sMesh.position.set(
          origin.x + (Math.random() - 0.5) * 3.2,
          origin.y,
          origin.z + (Math.random() - 0.5) * 2.8
        );
        scene.add(sMesh);
        shards.push({
          mesh: sMesh,
          vx: (Math.random() - 0.5) * 4.5,
          vy: 1.5 + Math.random() * 3.2,
          vz: (Math.random() - 0.5) * 4.5,
          rx: (Math.random() - 0.5) * 9,
          ry: (Math.random() - 0.5) * 9,
        });
      }
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredKey: string | null = null;

    const getHitTile = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableTiles);
      return hits[0]?.object as THREE.Mesh | undefined;
    };

    const onPointerMove = (e: PointerEvent) => {
      const hit = getHitTile(e.clientX, e.clientY);
      hoveredKey = hit ? `${hit.userData.rowIndex}_${hit.userData.side}` : null;
      renderer.domElement.style.cursor = hit ? "pointer" : "default";
    };

    const onPointerDown = (e: PointerEvent) => {
      soundEngine.unlock();
      const s = stateRef.current;
      if (!s?.isMyTurn || s.finished) return;
      const hit = getHitTile(e.clientX, e.clientY);
      if (!hit) return;
      const me = (s.players || []).find((p: any) => p.id === myUserId);
      if (!me) return;
      if (hit.userData.rowIndex === me.row + 1) {
        onActionRef.current({ type: "step", side: hit.userData.side });
      }
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    const avatars = new Map<string, { av: ArticulatedAvatar; fallingY: number; lastRow: number; jumpT: number }>();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const s = stateRef.current;

      if (s) {
        const me = (s.players || []).find((p: any) => p.id === myUserId);
        const myNextRow = me ? me.row + 1 : -1;

        (s.revealedRows || []).forEach((row: any) => {
          (["LEFT", "RIGHT"] as const).forEach((side) => {
            const key = `${row.rowIndex}_${side}`;
            const tileState = side === "LEFT" ? row.leftState : row.rightState;
            const mesh = tileMeshes[key];
            if (!mesh) return;
            const mat = mesh.material as THREE.MeshPhysicalMaterial;

            if (tileState === "broken") {
              if (!shatteredKeys.has(key)) {
                shatteredKeys.add(key);
                spawnShatter(mesh.position);
              }
              mesh.visible = false;
            } else if (tileState === "safe") {
              mesh.visible = true;
              mat.color.setHex(0x10b981);
              mat.emissive.setHex(0x059669);
              mat.emissiveIntensity = 0.55;
              mat.opacity = 0.72;
            } else {
              mesh.visible = true;
              const isSelectable = s.isMyTurn && row.rowIndex === myNextRow;
              const isHover = isSelectable && hoveredKey === key;
              mat.color.setHex(isHover ? 0xfef08a : isSelectable ? 0x1e293b : 0x0b0f1d);
              mat.emissive.setHex(isHover ? 0xf59e0b : isSelectable ? 0xec4899 : 0x2e1065);
              mat.emissiveIntensity = isHover ? 0.85 : isSelectable ? 0.45 : 0.18;
              mat.opacity = isHover ? 0.8 : 0.58;
            }
          });
        });

        for (let i = shards.length - 1; i >= 0; i--) {
          const sh = shards[i];
          sh.vy -= 14 * dt;
          sh.mesh.position.x += sh.vx * dt;
          sh.mesh.position.y += sh.vy * dt;
          sh.mesh.position.z += sh.vz * dt;
          sh.mesh.rotation.x += sh.rx * dt;
          sh.mesh.rotation.y += sh.ry * dt;
          if (sh.mesh.position.y < -35) {
            scene.remove(sh.mesh);
            shards.splice(i, 1);
          }
        }

        let focusZ = 0;
        (s.players || []).forEach((p: any, idx: number) => {
          let entry = avatars.get(p.id);
          if (!entry) {
            const av = createArticulatedAvatar("#0F766E", p.displayName, p.id === myUserId, idx);
            av.group.position.set(-2.5 + idx * 1.6, 0, -4.5);
            scene.add(av.group);
            entry = { av, fallingY: 0, lastRow: p.row, jumpT: 0 };
            avatars.set(p.id, entry);
          }

          if (p.row !== entry.lastRow && !p.eliminated) {
            entry.lastRow = p.row;
            entry.jumpT = 1.0;
            soundEngine.playGlassStep();
          }
          if (entry.jumpT > 0) entry.jumpT = Math.max(0, entry.jumpT - dt * 2.8);

          let targetX = -2.5 + idx * 1.5;
          let targetZ = -4.5;
          if (p.finished) {
            targetZ = finishZ;
          } else if (p.row >= 0) {
            const rowObj = s.revealedRows?.[p.row];
            targetX = rowObj?.leftState === "safe" ? 2.35 : -2.35;
            targetZ = p.row * rowSpacing + 1.5;
          }

          if (p.eliminated) {
            entry.fallingY -= 18 * dt;
            entry.av.group.position.y = Math.max(-40, entry.fallingY);
            entry.av.group.rotation.x += 4 * dt;
            entry.av.group.rotation.z += 2.5 * dt;
          } else {
            const jumpArc = Math.sin(entry.jumpT * Math.PI) * 1.85;
            entry.av.group.position.x += (targetX - entry.av.group.position.x) * Math.min(1, dt * 8);
            entry.av.group.position.z += (targetZ - entry.av.group.position.z) * Math.min(1, dt * 8);
            entry.av.group.position.y = jumpArc;
          }

          if (p.id === s.currentTurnPlayerId) {
            focusZ = Math.max(-2, targetZ);
          }
        });

        const desiredCam = new THREE.Vector3(0, 9.2, focusZ - 10.5);
        camera.position.lerp(desiredCam, Math.min(1, dt * 4));
        camera.lookAt(0, 1.2, focusZ + 12);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.dispose();
    };
  }, [myUserId]);

  const currentTurnPlayer = state.players?.find((p: any) => p.id === state.currentTurnPlayerId);

  return (
    <div className="space-y-3">
      <div className="relative h-[540px] w-full overflow-hidden rounded-3xl border-2 border-pink-500/45 bg-[#030308]">
        <div ref={mountRef} className="w-full h-full" />

        <div className="pointer-events-none absolute top-3 inset-x-3 flex items-center justify-between gap-2">
          <div className="rounded-2xl bg-black/75 backdrop-blur-md border border-pink-500/30 px-4 py-2 text-xs text-white">
            <div className="font-black uppercase text-pink-400">
              {state.isMyTurn ? "YOUR TURN — JUMP ON LEFT OR RIGHT GLASS!" : `${currentTurnPlayer?.displayName}'s Turn`}
            </div>
            <div className="text-[11px] text-slate-200 mt-0.5">{state.lastEvent}</div>
          </div>

          <span className="rounded-xl bg-black/75 backdrop-blur border border-amber-400/30 px-3 py-2 text-xs font-bold text-amber-300 inline-flex items-center gap-1">
            <Timer className="h-4 w-4" /> {state.remainingSeconds}s
          </span>
        </div>

        {state.isMyTurn && !state.finished && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
            <button
              onClick={() => {
                soundEngine.unlock();
                onAction({ type: "step", side: "LEFT" });
              }}
              className="btn-primary !px-7 !py-3 text-sm shadow-xl"
            >
              Jump LEFT Glass [A]
            </button>
            <button
              onClick={() => {
                soundEngine.unlock();
                onAction({ type: "step", side: "RIGHT" });
              }}
              className="btn-primary !px-7 !py-3 text-sm shadow-xl"
            >
              Jump RIGHT Glass [D]
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(state.players || []).map((p: any, idx: number) => {
          const iconicNums = ["456", "067", "218", "001", "199", "101"];
          return (
            <div
              key={p.id}
              className={`rounded-xl border px-3 py-2 text-xs ${
                p.id === state.currentTurnPlayerId
                  ? "border-pink-500 bg-pink-500/15"
                  : "glass-card"
              }`}
            >
              <div className="font-bold truncate">
                #{iconicNums[idx % iconicNums.length]} {p.displayName}
              </div>
              <div className="text-[11px] text-slate-400">
                {p.eliminated ? "Fell!" : p.finished ? "Survived!" : `Panel ${p.row + 1}/${state.rows}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
