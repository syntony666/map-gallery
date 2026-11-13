// Sizing rule regression check: fake country shapes × fake viewports.
// Run: node apps/web/src/components/map/mapSizing.test.mjs
import { computeCanvasSize } from "./mapSizing.ts";

const shapes = [
  ["台灣", 672, 1267],
  ["日本", 900, 2700],
  ["美國", 1600, 890],
  ["正方形", 1000, 1000],
];

const viewports = [
  ["桌面 1400×900", 1400, 900],
  ["平板直立 768×1024", 768, 1024],
  ["手機 390×844", 390, 844],
  ["手機橫向 844×390", 844, 390],
];

let failed = 0;
const expect = (name, cond, detail) => {
  if (!cond) {
    failed++;
    console.log(`  ✗ ${name}: ${detail}`);
  }
};

console.log("畫布尺寸（捲動軸）:");
for (const [vn, vw, vh] of viewports) {
  console.log(`\n${vn}`);
  for (const [sn, sw, sh] of shapes) {
    const { width, height } = computeCanvasSize(sw, sh, vw, vh);
    const axes = [
      width > vw + 0.5 ? "水平" : "",
      height > vh + 0.5 ? "垂直" : "",
    ]
      .filter(Boolean)
      .join("+");
    console.log(
      `  ${sn}: ${Math.round(width)}×${Math.round(height)} ${axes || "不滾"}`,
    );
  }
}

console.log("\n關鍵斷言:");
const s = (sw, sh, vw, vh) => computeCanvasSize(sw, sh, vw, vh);
const scrollsX = (r, vw) => r.width > vw + 0.5;
const scrollsY = (r, vh) => r.height > vh + 0.5;

// 台灣：直立裝置不滾；橫向手機太窄 → 垂直滾
for (const [vn, vw, vh] of viewports.slice(0, 3)) {
  const r = s(672, 1267, vw, vh);
  expect(
    `台灣 ${vn}`,
    !scrollsX(r, vw) && !scrollsY(r, vh),
    `${r.width}×${r.height}`,
  );
}
{
  const r = s(672, 1267, 844, 390);
  expect(
    "台灣手機橫垂直滾",
    scrollsY(r, 390) && !scrollsX(r, 844),
    `${r.width}×${r.height}`,
  );
}
// 日本：太窄 → 填寬、垂直滾（含上限）
{
  const r1 = s(900, 2700, 390, 844);
  expect(
    "日本手機垂直滾",
    scrollsY(r1, 844) && !scrollsX(r1, 390),
    `${r1.width}×${r1.height}`,
  );
  const r2 = s(900, 2700, 1400, 900);
  expect(
    "日本桌面垂直滾",
    scrollsY(r2, 900) && !scrollsX(r2, 1400),
    `${r2.width}×${r2.height}`,
  );
  expect("日本桌面高度上限", r2.height <= 900 * 1.5 + 0.5, `${r2.height}`);
}
// 美國手機：水平滾動、寬度有上限
{
  const r = s(1600, 890, 390, 844);
  expect(
    "美國手機水平滾",
    scrollsX(r, 390) && !scrollsY(r, 844),
    `${r.width}×${r.height}`,
  );
  expect("美國手機上限", r.width <= 390 * 1.5 + 0.5, `${r.width}`);
}
// 美國桌面：貼合不滾
{
  const r = s(1600, 890, 1400, 900);
  expect(
    "美國桌面不滾",
    !scrollsX(r, 1400) && !scrollsY(r, 900),
    `${r.width}×${r.height}`,
  );
}
// 任何情況只滾單一軸，且滾動軸不超過上限
for (const [, sw, sh] of shapes) {
  for (const [vn, vw, vh] of viewports) {
    const r = s(sw, sh, vw, vh);
    expect(
      `單軸滾動 ${sw}x${sh}@${vn}`,
      !(scrollsX(r, vw) && scrollsY(r, vh)),
      `${r.width}×${r.height}`,
    );
    expect(
      `寬度上限 ${sw}x${sh}@${vn}`,
      r.width <= vw * 1.5 + 0.5,
      `${r.width}`,
    );
    expect(
      `高度上限 ${sw}x${sh}@${vn}`,
      r.height <= vh * 1.5 + 0.5,
      `${r.height}`,
    );
  }
}

console.log(failed === 0 ? "\n全部通過" : `\n${failed} 個失敗`);
process.exit(failed === 0 ? 0 : 1);
