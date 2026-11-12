const COLOR = {
  yellow: "#FFD485",
  pink: "#F8B6DA",
  purple: "#9799FE",
};

// Base tint per map region. Colored regions show a light wash at rest and a
// deeper shade on hover/active; regions not listed stay transparent-to-white.
export const REGION_COLORS: Record<string, string> = {
  "keelung-city": COLOR.pink,
  "taipei-city": COLOR.yellow,
  "new-taipei-city": COLOR.purple,
  "taoyuan-city": COLOR.pink,
  "hsinchu-region": COLOR.yellow,
  "miaoli-county": COLOR.purple,
  "taichung-city": COLOR.yellow,
  "changhua-county": COLOR.pink,
  "nantou-county": COLOR.pink,
  "yunlin-county": COLOR.yellow,
  "chiayi-region": COLOR.purple,
  "tainan-city": COLOR.yellow,
  "kaohsiung-city": COLOR.purple,
  "pingtung-county": COLOR.pink,
  "yilan-county": COLOR.pink,
  "hualien-county": COLOR.purple,
  "taitung-county": COLOR.yellow,
};
