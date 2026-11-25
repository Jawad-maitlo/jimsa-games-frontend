"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Timer, Skull, Maximize2, Minimize2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from "lucide-react";
import {
  ArticulatedAvatar,
  createArticulatedAvatar,
  createGiantDoll,
  createMeadowWallTexture,
  createPinkGuard,
  createSandGroundTexture,
} from "../../lib/threeHelpers";
import { soundEngine } from "../../lib/soundEngine";

interface Props {
  state: any;
  myUserId: string;
  onAction: (action: any) => void;
}

export function RedLightGreenLightBoard({ state, myUserId, onAction }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const keysRef = useRef<Set<string>>(new Set());
  const touchDirRef = useRef<{ dx: number; dz: number; sprint: boolean }>({ dx: 0, dz: 0, sprint: false });
  const prevPhaseRef = useRef<string | null>(null);
  const prevElimCountRef = useRef<number>(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Start Squid-Game-inspired tense BGM when arena mounts; stop on unmount
  useEffect(() => {
    soundEngine.startBgm("rlgl");
    return () => soundEngine.stopBgm();
  }, []);

  // Trigger Doll Song ("Aao sab khelein... Green Light!"), Red Light voice, and Gunshot SFX
  useEffect(() => {
    if (!state) return;
    if (prevPhaseRef.current === null && state.phase === "GREEN") {
      soundEngine.playDollSong();
    } else if (prevPhaseRef.current !== null && prevPhaseRef.current !== state.phase) {
      if (state.phase === "GREEN") soundEngine.playDollSong();
      else if (state.phase === "WARNING") soundEngine.playWarningTurn();
      else if (state.phase === "RED") soundEngine.playRedLightAlarm();
    }
    prevPhaseRef.current = state.phase;

    const elimCount = (state.players || []).filter((p: any) => p.eliminated).length;
    if (elimCount > prevElimCountRef.current) {
      soundEngine.playLaserElimination();
    }
    prevElimCountRef.current = elimCount;
  }, [state]);

  // Continuous WASD / Arrow / Touch movement loop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(e.code)) {
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          soundEngine.unlock();
          keysRef.current.add(e.code);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    const onBlur = () => keysRef.current.clear();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    const interval = setInterval(() => {
      const s = stateRef.current;
      if (!s || s.finished) return;
      const me = (s.players || []).find((p: any) => p.id === myUserId);
      if (!me || me.eliminated || me.finished) return;

      let dx = touchDirRef.current.dx;
      let dz = touchDirRef.current.dz;
      let sprint = touchDirRef.current.sprint;

      const k = keysRef.current;
      if (k.has("KeyW") || k.has("ArrowUp")) dz += 1;
      if (k.has("KeyS") || k.has("ArrowDown")) dz -= 1;
      if (k.has("KeyA") || k.has("ArrowLeft")) dx += 1;
      if (k.has("KeyD") || k.has("ArrowRight")) dx -= 1;
      if (k.has("ShiftLeft") || k.has("ShiftRight")) sprint = true;

      if (dx !== 0 || dz !== 0) {
        soundEngine.playFootstep(sprint);
        onActionRef.current({ type: "move", dx, dz, sprint });
      }
    }, 68);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [myUserId]);

  // Three.js Daylight Sandy Playground + Giant Doll + Pink Soldiers + Gnarled Tree
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Daylight painted sky
    scene.fog = new THREE.Fog(0xbfe3f4, 75, 220);

    const camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );
    camera.position.set(0, 6.8, -11.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Warm Daylight Sunlight + Sky Fill
    const hemi = new THREE.HemisphereLight(0xdff5ff, 0xc2a878, 1.05);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff7ed, 1.35);
    sun.position.set(35, 65, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    // Sandy Dirt Playground Ground
    const sandTex = createSandGroundTexture();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 145),
      new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.95, metalness: 0.0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 54);
    floor.receiveShadow = true;
    scene.add(floor);

    // Faint white Start Line & Iconic Hot-Pink Finish Line!
    const startLine = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 0.7),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.set(0, 0.03, 0);
    scene.add(startLine);

    const finishLine = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 1.35),
      new THREE.MeshBasicMaterial({ color: 0xec4899 })
    );
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(0, 0.04, 100);
    scene.add(finishLine);

    // Painted Sky & Golden Wheat-Field Arena Perimeter Walls
    const wallTex = createMeadowWallTexture();
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(145, 24), wallMat);
    leftWall.position.set(15.5, 12, 54);
    leftWall.rotation.y = -Math.PI / 2;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(145, 24), wallMat);
    rightWall.position.set(-15.5, 12, 54);
    rightWall.rotation.y = Math.PI / 2;
    scene.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(36, 24), wallMat);
    backWall.position.set(0, 12, 124);
    backWall.rotation.y = Math.PI;
    scene.add(backWall);

    // Guardhouse with orange tiled roof & green barred window on side wall (like image_41db1b.png)
    const guardHouse = new THREE.Group();
    guardHouse.position.set(-13.8, 0, 104);
    const ghWall = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 5.4, 7.5),
      new THREE.MeshStandardMaterial({ color: 0xe5e0d5, roughness: 0.9 })
    );
    ghWall.position.y = 2.7;
    const ghRoof = new THREE.Mesh(
      new THREE.ConeGeometry(5.2, 2.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 })
    );
    ghRoof.position.y = 6.7;
    ghRoof.rotation.y = Math.PI / 4;
    const ghWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.4, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 })
    );
    ghWindow.position.set(1.9, 3.5, 0);
    guardHouse.add(ghWall, ghRoof, ghWindow);
    scene.add(guardHouse);

    // Gnarled Dead Tree directly behind the Giant Doll (z = 115)
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0, 0, 116);
    const barkMat = new THREE.MeshStandardMaterial({ color: 0x3b2f2f, roughness: 0.95 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.9, 13, 10), barkMat);
    trunk.position.y = 6.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    [
      [-3.2, 13.5, 0.55],
      [3.4, 14.0, -0.58],
      [-1.8, 15.6, 0.25],
      [2.0, 15.8, -0.32],
      [0, 16.2, 0.05],
    ].forEach(([bx, by, rot]) => {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.65, 7.5, 8), barkMat);
      branch.position.set(bx, by, 0);
      branch.rotation.z = rot;
      treeGroup.add(branch);
    });
    scene.add(treeGroup);

    // Giant Singing Doll standing at z = 109 facing away initially (looking at tree during GREEN)
    const doll = createGiantDoll();
    doll.group.position.set(0, 0, 109);
    scene.add(doll.group);

    // Circular concrete pad under doll
    const dollPad = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.4, 0.14, 32),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 })
    );
    dollPad.position.set(0, 0.05, 109);
    scene.add(dollPad);

    // Pink Masked Soldiers standing guard flanking the Giant Doll & Finish Line!
    const guardPlacements: Array<[number, number, "circle" | "triangle" | "square", number]> = [
      [-6.8, 105, "triangle", Math.PI],
      [6.8, 105, "triangle", Math.PI],
      [-11.5, 101.5, "square", Math.PI * 0.85],
      [11.5, 101.5, "circle", -Math.PI * 0.85],
      [-12.2, 50, "triangle", Math.PI / 2],
      [12.2, 50, "triangle", -Math.PI / 2],
    ];
    guardPlacements.forEach(([gx, gz, shape, rotY]) => {
      const guard = createPinkGuard(shape);
      guard.position.set(gx, 0, gz);
      guard.rotation.y = rotY;
      scene.add(guard);
    });

    // Player Avatars Map (Teal-Green Tracksuits with Player Numbers)
    const avatars = new Map<string, ArticulatedAvatar>();

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
      const elapsed = clock.getElapsedTime();
      const s = stateRef.current;

      if (s && Array.isArray(s.players)) {
        // Doll head faces tree (0) during GREEN, spins to face players (Math.PI) on RED!
        const targetHeadY =
          s.phase === "RED" ? Math.PI : s.phase === "WARNING" ? Math.PI * 0.55 : 0;
        doll.headGroup.rotation.y += (targetHeadY - doll.headGroup.rotation.y) * Math.min(1, dt * 11);
        doll.laserCone.visible = s.phase === "RED";
        doll.eyeMat.color.setHex(s.phase === "RED" ? 0xef4444 : 0x111827);

        let myAvatar: ArticulatedAvatar | null = null;
        s.players.forEach((p: any, idx: number) => {
          let av = avatars.get(p.id);
          if (!av) {
            av = createArticulatedAvatar(
              p.color || "#0F766E",
              p.displayName,
              p.id === myUserId,
              idx
            );
            av.group.position.set(p.x ?? 0, 0, p.z ?? 0);
            scene.add(av.group);
            avatars.set(p.id, av);
          }

          const targetX = p.x ?? 0;
          const targetZ = p.z ?? p.position ?? 0;
          const prevX = av.group.position.x;
          const prevZ = av.group.position.z;

          av.group.position.x += (targetX - prevX) * Math.min(1, dt * 12);
          av.group.position.z += (targetZ - prevZ) * Math.min(1, dt * 12);

          const moveSpeed = Math.hypot(targetX - prevX, targetZ - prevZ);
          if (typeof p.yaw === "number") {
            av.group.rotation.y = p.yaw;
          }
          av.setEliminated(Boolean(p.eliminated));
          av.animateWalk(moveSpeed, elapsed);

          if (p.id === myUserId) myAvatar = av;
        });

        const focus = avatars.get(myUserId)?.group.position ?? new THREE.Vector3(0, 0, 10);
        const desiredCam = new THREE.Vector3(focus.x * 0.7, 6.8, focus.z - 11.5);
        camera.position.lerp(desiredCam, Math.min(1, dt * 6));
        camera.lookAt(focus.x * 0.45, 2.6, focus.z + 20);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [myUserId]);

  const me = state.players?.find((p: any) => p.id === myUserId);
  const phaseColor =
    state.phase === "GREEN"
      ? "bg-emerald-600 text-white shadow-lg"
      : state.phase === "WARNING"
        ? "bg-amber-400 text-slate-950 shadow-lg"
        : "bg-rose-600 text-white shadow-[0_0_25px_rgba(225,29,72,0.8)]";

  const holdMove = (dx: number, dz: number, sprint = false) => ({
    onPointerDown: () => {
      soundEngine.unlock();
      touchDirRef.current = { dx, dz, sprint };
    },
    onPointerUp: () => {
      touchDirRef.current = { dx: 0, dz: 0, sprint: false };
    },
    onPointerLeave: () => {
      touchDirRef.current = { dx: 0, dz: 0, sprint: false };
    },
  });

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-sky-950 p-3 flex flex-col" : "space-y-3"}>
      <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-pink-500/50 bg-sky-200 ${fullscreen ? "flex-1" : "h-[540px]"}`}>
        <div ref={mountRef} className="w-full h-full" />

        {/* Top HUD */}
        <div className="pointer-events-none absolute top-3 inset-x-3 flex items-start justify-between gap-2">
          <div className="rounded-2xl bg-slate-950/75 backdrop-blur-md border border-white/15 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-amber-300">
              <Timer className="h-4 w-4" /> {state.remainingSeconds}s
            </span>
            <span>Finish: <strong className="text-pink-400">{me?.position ?? 0}%</strong></span>
            {me?.eliminated && (
              <span className="inline-flex items-center gap-1 text-rose-400">
                <Skull className="h-4 w-4" /> Eliminated
              </span>
            )}
          </div>

          <div className={`rounded-2xl px-5 py-2 text-sm sm:text-base font-black tracking-wider transition-all ${phaseColor}`}>
            {state.phase === "GREEN"
              ? "🎵 AAO SAB KHELEIN — GREEN LIGHT!"
              : state.phase === "WARNING"
                ? "DOLL TURNING — STOP!"
                : "RED LIGHT — FREEZE!"}
          </div>

          <button
            onClick={() => setFullscreen((v) => !v)}
            className="pointer-events-auto rounded-xl bg-slate-950/75 backdrop-blur border border-white/20 p-2 text-white hover:bg-pink-600/80"
            title="Toggle Fullscreen"
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Bottom Event & Controls Bar */}
        <div className="pointer-events-none absolute bottom-3 left-3 max-w-md rounded-xl bg-slate-950/75 backdrop-blur px-3.5 py-2 text-xs font-semibold text-white border border-white/15">
          {state.lastEvent}
          <div className="text-[10px] text-teal-300 mt-0.5">
            Hold <strong>W / A / S / D</strong> or <strong>Arrows</strong> to run • Hold <strong>Shift</strong> to sprint across the Pink Line
          </div>
        </div>

        {/* Touch / Mouse 3D D-Pad */}
        {!me?.eliminated && !me?.finished && !state.finished && (
          <div className="absolute bottom-3 right-3 flex items-end gap-2 select-none">
            <div className="grid grid-cols-3 gap-1.5">
              <div />
              <button {...holdMove(0, 1, false)} className="h-11 w-11 rounded-xl bg-teal-700/90 active:bg-emerald-500 text-white flex items-center justify-center border border-white/30">
                <ArrowUp className="h-5 w-5" />
              </button>
              <div />
              <button {...holdMove(1, 0, false)} className="h-11 w-11 rounded-xl bg-teal-700/90 active:bg-emerald-500 text-white flex items-center justify-center border border-white/30">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button {...holdMove(0, -1, false)} className="h-11 w-11 rounded-xl bg-teal-700/90 active:bg-emerald-500 text-white flex items-center justify-center border border-white/30">
                <ArrowDown className="h-5 w-5" />
              </button>
              <button {...holdMove(-1, 0, false)} className="h-11 w-11 rounded-xl bg-teal-700/90 active:bg-emerald-500 text-white flex items-center justify-center border border-white/30">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <button
              {...holdMove(0, 1, true)}
              className="h-14 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-xs flex items-center gap-1 border border-white/30 shadow-lg active:scale-95"
            >
              <Zap className="h-4 w-4" /> SPRINT
            </button>
          </div>
        )}
      </div>

      {/* Contestants Strip */}
      <div className="flex flex-wrap gap-2">
        {(state.players || []).map((p: any, idx: number) => {
          const iconicNums = ["456", "067", "218", "001", "199", "101", "240"];
          return (
            <div key={p.id} className="rounded-xl glass-card px-3 py-1.5 text-xs font-bold flex items-center gap-2">
              <span className="rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-mono text-white">
                {iconicNums[idx % iconicNums.length]}
              </span>
              <span>{p.displayName}</span>
              <span className={p.eliminated ? "text-rose-500" : p.finished ? "text-emerald-500" : "text-pink-500"}>
                {p.eliminated ? "ELIMINATED" : p.finished ? "PASSED" : `${p.position}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
