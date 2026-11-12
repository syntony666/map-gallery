export type RegionShapes = {
  transform: string;
  regions: { id: string; paths: string[] }[];
};

export function parseRegionsSvg(svgText: string): RegionShapes {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const wrapper = doc.querySelector("svg > g");

  return {
    transform: wrapper?.getAttribute("transform") ?? "",
    regions: [...doc.querySelectorAll("svg > g > g[id]")].map((group) => ({
      id: group.id,
      paths: [...group.querySelectorAll("path")].map(
        (path) => path.getAttribute("d") ?? "",
      ),
    })),
  };
}
