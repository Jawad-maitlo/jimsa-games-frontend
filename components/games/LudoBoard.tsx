"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Dices, Home, Swords } from "lucide-react";
import { soundEngine } from "../../lib/soundEngine";

interface Props {
  state: any;
  myUserId: string;
  onAction: (action: any) => void;
}

const START_OFFSETS: Record<string, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const HEX_BY_COLOR: Record<string, number> = {
  red: 0xf43f5e,
  green: 0x10b981,
  yellow: 0xf59e0b,
  blue: 0x38bdf8,
};

function getTrack3DPos(globalSq: number): [number, number] {
  const angle = (globalSq / 52) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * 7.2, Math.sin(angle) * 7.2];
}

function getYard3DPos(color: string, tIdx: number): [number, number] {
  const centers: Record<string, [number, number]> = {
    red: [-7.5, -7.5],
    green: [7.5, -7.5],
    yellow: [7.5, 7.5],
    blue: [-7.5, 7.5],
  };
  const [cx, cz] = centers[color] || [0, 0];
  const ox = tIdx % 2 === 0 ? -0.9 : 0.9;
  const oz = tIdx < 2 ? -0.9 : 0.9;
  return [cx + ox, cz + oz];
}

function getHomeStretch3DPos(color: string, step: number): [number, number] {
  const ratio = Math.max(0, 1 - (step - 50) / 6);
  const dirs: Record<string, [number, number]> = {
    red: [0, -6.2],
    green: [6.2, 0],
    yellow: [0, 6.2],
    blue: [-6.2, 0],
  };
  const [dx, dz] = dirs[color] || [0, 0];
  return [dx * ratio, dz * ratio];
}

export function LudoBoard({ state, myUserId, onAction }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const prevEventRef = useRef<string>("");
  const prevCapturesRef = useRef<number>(0);

  // Trigger procedural SFX for dice rolls, pawn moves, and captures
  useEffect(() => {
    if (!state) return;
    const totalCaptures = (state.players || []).reduce(
      (sum: number, p: any) => sum + (p.captures || 0),
      0
    );

    if (totalCaptures > prevCapturesRef.current) {
      soundEngine.playCapture();
    } else if (state.lastEvent && state.lastEvent !== prevEventRef.current) {
      const ev = String(state.lastEvent).toLowerCase();
      if (ev.includes("rolled")) {
        soundEngine.playDiceRoll();
      } else if (ev.includes("moved") || ev.includes("deployed") || ev.includes("home")) {
        soundEngine.playBoardMove();
      }
    }

    prevCapturesRef.current = totalCaptures;
    prevEventRef.current = state.lastEvent || "";
  }, [state]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c1f);

    const camera = new THREE.PerspectiveCamera(48, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 17, 15.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe0e7ff, 0x1e1b4b, 1.1));
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 22, 12);
    light.castShadow = true;
    scene.add(light);

    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(11.8, 12.4, 0.7, 48),
      new THREE.MeshStandardMaterial({ color: 0x141833, roughness: 0.5, metalness: 0.35 })
    );
    table.position.y = -0.4;
    table.receiveShadow = true;
    scene.add(table);

    (["red", "green", "yellow", "blue"] as const).forEach((color) => {
      const [cx, cz] = getYard3DPos(color, 0);
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.25, 3.8),
        new THREE.MeshStandardMaterial({
          color: HEX_BY_COLOR[color],
          roughness: 0.35,
          transparent: true,
          opacity: 0.85,
        })
      );
      base.position.set(cx + 0.9, 0.05, cz + 0.9);
      scene.add(base);
    });

    for (let sq = 0; sq < 52; sq++) {
      const [x, z] = getTrack3DPos(sq);
      const isSafe = SAFE_SQUARES.has(sq);
      const tile = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.46, 0.2, 16),
        new THREE.MeshStandardMaterial({
          color: isSafe ? 0xfbbf24 : 0x312e81,
          emissive: isSafe ? 0xb45309 : 0x1e1b4b,
          emissiveIntensity: isSafe ? 0.55 : 0.2,
        })
      );
      tile.position.set(x, 0.05, z);
      scene.add(tile);
    }

    const homeCenter = new THREE.Mesh(
      new THREE.ConeGeometry(1.7, 0.7, 4),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x5b21b6, emissiveIntensity: 0.6 })
    );
    homeCenter.position.set(0, 0.35, 0);
    scene.add(homeCenter);

    const dieMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
    );
    dieMesh.position.set(0, 1.8, 0);
    dieMesh.castShadow = true;
    scene.add(dieMesh);

    const tokenMeshes = new Map<string, THREE.Group>();
    const clickableTokens: THREE.Object3D[] = [];

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (e: PointerEvent) => {
      soundEngine.unlock();
      const s = stateRef.current;
      if (!s?.isMyTurn || s.phase !== "MOVE" || s.finished) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableTokens, true);
      if (hits.length === 0) return;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && obj.userData?.tokenIndex === undefined) obj = obj.parent;
      if (obj && obj.userData.playerId === myUserId) {
        onActionRef.current({ type: "move", tokenIndex: obj.userData.tokenIndex });
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let lastDice: number | null = null;
    let dieSpinTimer = 0;
    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const elapsed = clock.getElapsedTime();
      const s = stateRef.current;

      if (s) {
        if (s.diceValue !== lastDice) {
          lastDice = s.diceValue;
          if (s.diceValue !== null) dieSpinTimer = 0.65;
        }
        if (dieSpinTimer > 0) {
          dieSpinTimer = Math.max(0, dieSpinTimer - dt);
          dieMesh.rotation.x += 15 * dt;
          dieMesh.rotation.y += 12 * dt;
          dieMesh.position.y = 1.8 + Math.sin((dieSpinTimer / 0.65) * Math.PI) * 2.2;
        } else {
          dieMesh.position.y = 1.8 + Math.sin(elapsed * 2.5) * 0.15;
          dieMesh.rotation.y += 0.4 * dt;
        }

        const validIndices: number[] = s.validTokenIndices || [];

        (s.players || []).forEach((p: any) => {
          (p.tokens || []).forEach((pos: number, tIdx: number) => {
            const key = `${p.id}_${tIdx}`;
            let grp = tokenMeshes.get(key);
            if (!grp) {
              grp = new THREE.Group();
              const mat = new THREE.MeshStandardMaterial({
                color: HEX_BY_COLOR[p.color] || 0xffffff,
                roughness: 0.25,
                metalness: 0.3,
              });
              const body = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.0, 14), mat);
              body.position.y = 0.5;
              const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), mat);
              head.position.y = 1.05;
              const halo = new THREE.Mesh(
                new THREE.RingGeometry(0.45, 0.62, 20),
                new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide })
              );
              halo.rotation.x = -Math.PI / 2;
              halo.position.y = 0.08;
              halo.visible = false;
              grp.add(body, head, halo);
              grp.userData = { playerId: p.id, tokenIndex: tIdx, halo };
              scene.add(grp);
              tokenMeshes.set(key, grp);
              clickableTokens.push(grp);
            }

            let tx = 0;
            let tz = 0;
            if (pos === -1) {
              [tx, tz] = getYard3DPos(p.color, tIdx);
            } else if (pos <= 50) {
              const gSq = (START_OFFSETS[p.color] + pos) % 52;
              [tx, tz] = getTrack3DPos(gSq);
              tx += (tIdx - 1.5) * 0.14;
            } else {
              [tx, tz] = getHomeStretch3DPos(p.color, pos);
            }

            grp.position.x += (tx - grp.position.x) * Math.min(1, dt * 8);
            grp.position.z += (tz - grp.position.z) * Math.min(1, dt * 8);

            const isMovable = p.id === myUserId && s.isMyTurn && s.phase === "MOVE" && validIndices.includes(tIdx);
            grp.userData.halo.visible = isMovable;
            grp.position.y = isMovable ? 0.2 + Math.abs(Math.sin(elapsed * 7)) * 0.55 : 0.15;
          });
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.dispose();
    };
  }, [myUserId]);

  const activePlayer = state.players?.find((p: any) => p.id === state.currentTurnPlayerId);
  const canRoll = state.isMyTurn && state.phase === "ROLL" && !state.finished;
  const validIndices: number[] = state.validTokenIndices || [];

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase text-violet-500">
            {state.isMyTurn ? "YOUR TURN — CLICK ROLL OR CLICK A GLOWING 3D PAWN!" : `${activePlayer?.displayName}'s Turn`}
          </div>
          <p className="text-xs sm:text-sm font-semibold mt-0.5">{state.lastEvent}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-violet-500/50 bg-white dark:bg-white/10 text-xl font-black">
            {state.diceValue ?? "?"}
          </div>
          <button
            disabled={!canRoll}
            onClick={() => {
              soundEngine.unlock();
              onAction({ type: "roll" });
            }}
            className="btn-primary !py-3"
          >
            <Dices className="h-5 w-5" /> Roll 3D Die
          </button>
        </div>
      </div>

      <div className="h-[480px] w-full overflow-hidden rounded-3xl border-2 border-violet-500/40 bg-[#080C1F] cursor-pointer">
        <div ref={mountRef} className="w-full h-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(state.players || []).map((p: any) => (
          <div key={p.id} className="glass-card rounded-xl p-3 text-xs space-y-2">
            <div className="flex justify-between font-bold">
              <span className="truncate">{p.displayName}</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-amber-500 inline-flex items-center"><Swords className="h-3 w-3 mr-0.5" />{p.captures}</span>
                <span className="text-emerald-500 inline-flex items-center"><Home className="h-3 w-3 mr-0.5" />{p.tokens.filter((t: number) => t === 56).length}/4</span>
              </span>
            </div>
            {p.id === myUserId && state.isMyTurn && state.phase === "MOVE" && (
              <div className="flex gap-1.5">
                {validIndices.map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEngine.unlock();
                      onAction({ type: "move", tokenIndex: idx });
                    }}
                    className="btn-primary !px-2.5 !py-1 text-[11px] flex-1"
                  >
                    Move T{idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
