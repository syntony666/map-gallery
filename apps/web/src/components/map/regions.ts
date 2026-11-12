/** West coast north→south, then east coast north→south; for region pickers. */
const REGION_SORT_ORDER = [
  "keelung-city",
  "taipei-city",
  "new-taipei-city",
  "taoyuan-city",
  "hsinchu-region",
  "miaoli-county",
  "taichung-city",
  "changhua-county",
  "nantou-county",
  "yunlin-county",
  "chiayi-region",
  "tainan-city",
  "kaohsiung-city",
  "pingtung-county",
  "yilan-county",
  "hualien-county",
  "taitung-county",
];

export function regionSortKey(id: string) {
  const index = REGION_SORT_ORDER.indexOf(id);
  return index === -1 ? REGION_SORT_ORDER.length : index;
}

export type RegionShapes = {
  transform: string;
  regions: {
    id: string;
    paths: string[];
    /** path data of enclave regions to cut out of this region's highlight */
    holes: string[];
  }[];
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

function bboxContains(outer: BBox, inner: BBox, margin = 1) {
  return (
    inner.minX > outer.minX + margin &&
    inner.maxX < outer.maxX - margin &&
    inner.minY > outer.minY + margin &&
    inner.maxY < outer.maxY - margin
  );
}

function unionBBox(boxes: BBox[]): BBox {
  return {
    minX: Math.min(...boxes.map((b) => b.minX)),
    maxX: Math.max(...boxes.map((b) => b.maxX)),
    minY: Math.min(...boxes.map((b) => b.minY)),
    maxY: Math.max(...boxes.map((b) => b.maxY)),
  };
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
        (best, path, i) =>
          bboxArea(path.bbox) > bboxArea(region.paths[best].bbox) ? i : best,
        0,
      ),
    ]),
  );

  // Enclave outlines drawn inside a neighbouring region (e.g. Taipei's ring
  // inside New Taipei) must not be painted when that neighbour is hovered:
  // drop any path that duplicates another region's main body.
  const regions = parsed.map((region) => {
    const paths = region.paths
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
      .map((path) => path.d);
    const main = region.paths[largest.get(region.id) ?? 0];
    return { id: region.id, paths, mainBBox: main?.bbox };
  });

  // A region whose bbox sits strictly inside another region's main body is an
  // enclave (Taipei and Keelung inside New Taipei). The host's highlight is
  // masked out of the enclave interior; the enclave outline itself is stroked
  // again so the border keeps a visible rim.
  return {
    transform: wrapper?.getAttribute("transform") ?? "",
    regions: regions.map((region) => ({
      id: region.id,
      paths: region.paths,
      holes: region.mainBBox
        ? regions
            .filter(
              (inner) =>
                inner.id !== region.id &&
                inner.paths.length > 0 &&
                bboxContains(
                  region.mainBBox,
                  unionBBox(inner.paths.map((d) => pathBBox(d))),
                ),
            )
            .flatMap((inner) => inner.paths)
        : [],
    })),
  };
}
