export const areaSeedData = [
  // 六都
  {
    id: "taipei-city",
    name: "臺北市",
  },
  {
    id: "new-taipei-city",
    name: "新北市",
  },
  {
    id: "taoyuan-city",
    name: "桃園市",
  },
  {
    id: "taichung-city",
    name: "臺中市",
  },
  {
    id: "tainan-city",
    name: "臺南市",
  },
  {
    id: "kaohsiung-city",
    name: "高雄市",
  },

  // 三市
  {
    id: "keelung-city",
    name: "基隆市",
  },
  {
    id: "hsinchu-city",
    name: "新竹市",
  },
  {
    id: "chiayi-city",
    name: "嘉義市",
  },

  // 十三縣
  {
    id: "yilan-county",
    name: "宜蘭縣",
  },
  {
    id: "hsinchu-county",
    name: "新竹縣",
  },
  {
    id: "miaoli-county",
    name: "苗栗縣",
  },
  {
    id: "changhua-county",
    name: "彰化縣",
  },
  {
    id: "nantou-county",
    name: "南投縣",
  },
  {
    id: "yunlin-county",
    name: "雲林縣",
  },
  {
    id: "chiayi-county",
    name: "嘉義縣",
  },
  {
    id: "pingtung-county",
    name: "屏東縣",
  },
  {
    id: "hualien-county",
    name: "花蓮縣",
  },
  {
    id: "taitung-county",
    name: "臺東縣",
  },
  {
    id: "penghu-county",
    name: "澎湖縣",
  },
  {
    id: "kinmen-county",
    name: "金門縣",
  },
  {
    id: "lienchiang-county",
    name: "連江縣",
  },
] as const;

export type AreaSeedData = (typeof areaSeedData)[number];
