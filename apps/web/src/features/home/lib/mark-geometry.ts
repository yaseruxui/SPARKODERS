import { ExtrudeGeometry, Shape, Vector2, type BufferGeometry, type UVGenerator } from 'three';
import { MARK_HEIGHT, MARK_WIDTH, markPieces } from './mark-outline';

/**
 * Maps every vertex to the texture by its (x, y) position in mark space, for caps and side walls
 * alike, so the extruded edges continue the artwork's gradient instead of stretching one pixel.
 */
const planarUV: UVGenerator = {
  generateTopUV(_geometry: BufferGeometry, vertices: number[], a: number, b: number, c: number) {
    return [a, b, c].map((i) => toUV(vertices, i));
  },
  generateSideWallUV(_geometry: BufferGeometry, vertices: number[], a: number, b: number, c: number, d: number) {
    return [a, b, c, d].map((i) => toUV(vertices, i));
  },
};

function toUV(vertices: number[], index: number): Vector2 {
  const x = vertices[index * 3] ?? 0;
  const y = vertices[index * 3 + 1] ?? 0;
  // Texture rows run top → bottom while v runs bottom → top.
  return new Vector2(x / MARK_WIDTH, 1 - y / MARK_HEIGHT);
}

export interface MarkPieceGeometry {
  geometry: ExtrudeGeometry;
  /** Offset toward the viewer, in mark units, so the ribbons sit on separate layers. */
  depth: number;
}

/** Extrudes both ribbons of the S mark (mark space: 1024 wide, y pointing down). */
export function buildMarkGeometries(): MarkPieceGeometry[] {
  return markPieces.map((outline, index) => {
    const shape = new Shape(outline.map(([x, y]) => new Vector2(x, y)));
    const geometry = new ExtrudeGeometry(shape, {
      depth: 70,
      bevelEnabled: true,
      bevelThickness: 14,
      bevelSize: 10,
      bevelSegments: 5,
      curveSegments: 8,
      UVGenerator: planarUV,
    });
    return { geometry, depth: index * 36 };
  });
}

export { MARK_HEIGHT, MARK_WIDTH };
