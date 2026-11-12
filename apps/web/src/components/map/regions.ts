export type RegionShapes = {
  transform: string;
  regions: { id: string; paths: string[] }[];
};

type BBox = { minX: number; maxX: number; minY: number; maxY: number };

function pathBBox(d: string): BBox {
  const nums = d.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function bboxArea(b: BBox) {
  return (b.maxX - b.minX) * (b.maxY - b.minY);
}

function bboxEquals(a: BBox, b: BBox, tolerance = 0.5) {
  return (
    Math.abs(a.minX - b.minX) < tolerance &&
    Math.abs(a.maxX - b.maxX) < tolerance &&
    Math.abs(a.minY - b.minY) < tolerance &&
    Math.abs(a.maxY - b.maxY) < tolerance
  );
}

export function parseRegionsSvg(svgText: string): RegionShapes {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const wrapper = doc.querySelector("svg > g");

  const parsed = [...doc.querySelectorAll("svg > g > g[id]")].map((group) => ({
    id: group.id,
    paths: [...group.querySelectorAll("path")].map((path) => {
      const d = path.getAttribute("d") ?? "";
      return { d, bbox: pathBBox(d) };
    }),
  }));

  const largest = new Map(
    parsed.map((region) => [
      region.id,
      region.paths.reduce(
        (best, path, i) => (bboxArea(path.bbox) > bboxArea(region.paths[best].bbox) ? i : best),
        0,
      ),
    ]),
  );

  // Enclave outlines drawn inside a neighbouring region (e.g. Taipei's ring
  // inside New Taipei) must not be painted when that neighbour is hovered:
  // drop any path that duplicates another region's main body.
  const regions = parsed.map((region) => ({
    id: region.id,
    paths: region.paths
      .filter((path, i) => {
        if (i === largest.get(region.id)) {
          return true;
        }
        return !parsed.some(
          (other) =>
            other.id !== region.id &&
            other.paths.some(
              (otherPath, j) =>
                j === largest.get(other.id) &&
                bboxEquals(path.bbox, otherPath.bbox),
            ),
        );
      })
      .map((path) => path.d),
  }));

  return {
    transform: wrapper?.getAttribute("transform") ?? "",
    regions,
  };
}
