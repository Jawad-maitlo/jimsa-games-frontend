"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Flag, Eye } from "lucide-react";
import { soundEngine } from "../../lib/soundEngine";

interface Props {
  state: any;
  myUserId: string;
  onAction: (action: any) => void;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

function createChessPieceMesh(type: string, color: "w" | "b"): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: color === "w" ? 0xf8fafc : 0x1e1b4b,
    roughness: color === "w" ? 0.25 : 0.3,
    metalness: color === "w" ? 0.15 : 0.65,
    emissive: color === "w" ? 0x1e293b : 0x3b0764,
    emissiveIntensity: 0.15,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.18, 16), mat);
  base.position.y = 0.09;
  base.castShadow = true;
  group.add(base);

  if (type === "p") {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 0.48, 14), mat);
    stem.position.y = 0.42;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), mat);
    head.position.y = 0.76;
    group.add(stem, head);
  } else if (type === "r") {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.7, 14), mat);
    tower.position.y = 0.53;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.25, 0.2, 8), mat);
    crown.position.y = 0.96;
    group.add(tower, crown);
  } else if (type === "n") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.55, 12), mat);
    body.position.y = 0.45;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.46), mat);
    head.position.set(0, 0.85, color === "w" ? -0.06 : 0.06);
    head.rotation.x = color === "w" ? 0.3 : -0.3;
    group.add(body, head);
  } else if (type === "b") {
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.9, 14), mat);
    body.position.y = 0.62;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), mat);
    orb.position.y = 1.08;
    group.add(body, orb);
  } else if (type === "q") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.95, 16), mat);
    body.position.y = 0.66;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 10, 18), mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.15;
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), mat);
    gem.position.y = 1.28;
    group.add(body, ring, gem);
  } else {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.31, 1.08, 16), mat);
    body.position.y = 0.72;
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, 0.1), mat);
    crossV.position.y = 1.42;
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.1), mat);
    crossH.position.y = 1.46;
    group.add(body, crossV, crossH);
  }

  return group;
}

export function ChessBoard({ state, onAction }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const prevHistoryLenRef = useRef<number>(state?.history?.length || 0);
  const selectedRef = useRef<string | null>(null);
  const [selectedUi, setSelectedUi] = useState<string | null>(null);
  const [camPreset, setCamPreset] = useState<"cinematic" | "top">("cinematic");
  const camPresetRef = useRef(camPreset);
  camPresetRef.current = camPreset;

  // Trigger move / capture / check SFX
  useEffect(() => {
    const len = state?.history?.length || 0;
    if (len > prevHistoryLenRef.current) {
      const lastSan: string = state.history[len - 1] || "";
      if (state.inCheck || lastSan.includes("x") || lastSan.includes("+") || lastSan.includes("#")) {
        soundEngine.playCapture();
      } else {
        soundEngine.playBoardMove();
      }
    }
    prevHistoryLenRef.current = len;
  }, [state?.history?.length, state?.inCheck, state?.history]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090c1e);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe0e7ff, 0x1e1b4b, 1.1));
    const dir = new THREE.DirectionalLight(0xffffff, 1.3);
    dir.position.set(8, 16, 8);
    dir.castShadow = true;
    scene.add(dir);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 0.6, 9.2),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.35, metalness: 0.6 })
    );
    frame.position.y = -0.35;
    scene.add(frame);

    const squareMeshes: Record<string, THREE.Mesh> = {};
    const clickableSquares: THREE.Mesh[] = [];
    const ringMarkers: THREE.Mesh[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = `${FILES[c]}${RANKS[r]}`;
        const isLight = (r + c) % 2 === 0;
        const mat = new THREE.MeshStandardMaterial({
          color: isLight ? 0xe2e8f0 : 0x4338ca,
          roughness: 0.5,
          metalness: 0.15,
        });
        const tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.14, 1), mat);
        tile.position.set(c - 3.5, 0, r - 3.5);
        tile.receiveShadow = true;
        tile.userData = { sq, baseColor: isLight ? 0xe2e8f0 : 0x4338ca };
        scene.add(tile);
        squareMeshes[sq] = tile;
        clickableSquares.push(tile);

        const marker = new THREE.Mesh(
          new THREE.RingGeometry(0.24, 0.38, 24),
          new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
        );
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(c - 3.5, 0.09, r - 3.5);
        marker.visible = false;
        marker.userData = { sq };
        scene.add(marker);
        ringMarkers.push(marker);
      }
    }

    const piecesGroup = new THREE.Group();
    scene.add(piecesGroup);
    let lastRenderedFen = "";

    const syncPieces = (board: any[][]) => {
      while (piecesGroup.children.length > 0) {
        piecesGroup.remove(piecesGroup.children[0]);
      }
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board?.[r]?.[c];
          if (!piece) continue;
          const mesh = createChessPieceMesh(piece.type, piece.color);
          mesh.position.set(c - 3.5, 0.08, r - 3.5);
          mesh.userData = { sq: `${FILES[c]}${RANKS[r]}`, color: piece.color };
          piecesGroup.add(mesh);
        }
      }
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      soundEngine.unlock();
      const s = stateRef.current;
      if (!s || s.finished || !s.myColor || s.turn !== s.myColor) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const pieceHits = raycaster.intersectObjects(piecesGroup.children, true);
      let clickedSq: string | null = null;
      if (pieceHits.length > 0) {
        let obj: THREE.Object3D | null = pieceHits[0].object;
        while (obj && !obj.userData?.sq) obj = obj.parent;
        if (obj?.userData?.sq) clickedSq = obj.userData.sq;
      }
      if (!clickedSq) {
        const sqHits = raycaster.intersectObjects(clickableSquares);
        if (sqHits.length > 0) clickedSq = sqHits[0].object.userData.sq;
      }
      if (!clickedSq) return;

      const legalTargets = selectedRef.current
        ? (s.legalMoves || []).filter((m: any) => m.from === selectedRef.current).map((m: any) => m.to)
        : [];

      if (selectedRef.current && legalTargets.includes(clickedSq)) {
        onActionRef.current({ type: "move", from: selectedRef.current, to: clickedSq, promotion: "q" });
        selectedRef.current = null;
        setSelectedUi(null);
        return;
      }

      const hasLegalFrom = (s.legalMoves || []).some((m: any) => m.from === clickedSq);
      if (hasLegalFrom) {
        selectedRef.current = selectedRef.current === clickedSq ? null : clickedSq;
        setSelectedUi(selectedRef.current);
      } else {
        selectedRef.current = null;
        setSelectedUi(null);
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

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const s = stateRef.current;

      if (s) {
        if (s.fen !== lastRenderedFen && s.board) {
          lastRenderedFen = s.fen;
          syncPieces(s.board);
        }

        const isBlack = s.myColor === "b";
        const zSign = isBlack ? -1 : 1;
        const desiredPos =
          camPresetRef.current === "top"
            ? new THREE.Vector3(0, 12.2, 0.8 * zSign)
            : new THREE.Vector3(0, 8.2, 9.2 * zSign);
        camera.position.lerp(desiredPos, 0.08);
        camera.lookAt(0, 0, 0);

        const sel = selectedRef.current;
        const legalTargets = sel
          ? new Set((s.legalMoves || []).filter((m: any) => m.from === sel).map((m: any) => m.to))
          : new Set<string>();

        Object.values(squareMeshes).forEach((tile) => {
          const sq = tile.userData.sq;
          const mat = tile.material as THREE.MeshStandardMaterial;
          if (sq === sel) mat.color.setHex(0xfbbf24);
          else if (s.lastMove?.from === sq || s.lastMove?.to === sq) mat.color.setHex(0xa855f7);
          else mat.color.setHex(tile.userData.baseColor);
        });

        ringMarkers.forEach((m) => {
          m.visible = legalTargets.has(m.userData.sq);
        });

        piecesGroup.children.forEach((pObj) => {
          const targetY = pObj.userData.sq === sel ? 0.52 : 0.08;
          pObj.position.y += (targetY - pObj.position.y) * 0.2;
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
  }, []);

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
        <div>
          {state.turn === "w" ? `White (${state.white?.displayName})` : `Black (${state.black?.displayName})`} to move
          {state.inCheck && <span className="ml-2 text-rose-500">• CHECK!</span>}
          {selectedUi && <span className="ml-2 text-amber-400">• Selected {selectedUi}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCamPreset((p) => (p === "cinematic" ? "top" : "cinematic"))}
            className="btn-secondary !py-1.5 !px-3 text-xs"
          >
            <Eye className="h-3.5 w-3.5" /> {camPreset === "cinematic" ? "Top View" : "3D Angle"}
          </button>
          {!state.finished && state.myColor && (
            <button
              onClick={() => onAction({ type: "resign" })}
              className="btn-secondary !py-1.5 !px-3 text-xs text-rose-500 border-rose-500/30"
            >
              <Flag className="h-3.5 w-3.5" /> Resign
            </button>
          )}
        </div>
      </div>

      <div className="h-[500px] w-full overflow-hidden rounded-3xl border-2 border-violet-500/40 bg-[#090C1E] cursor-pointer">
        <div ref={mountRef} className="w-full h-full" />
      </div>

      <div className="glass-card rounded-2xl p-3 flex flex-wrap gap-1.5 text-xs font-mono">
        <span className="font-sans font-bold text-slate-400 mr-2">Moves:</span>
        {(state.history || []).length === 0 ? (
          <span className="text-slate-400">Click any of your 3D pieces to begin!</span>
        ) : (
          state.history.map((san: string, i: number) => (
            <span key={i} className="rounded bg-slate-100 dark:bg-white/10 px-2 py-0.5">
              {i + 1}.{san}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
