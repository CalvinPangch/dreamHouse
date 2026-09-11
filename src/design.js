/**
 * 暖阳半院 · Sunny Half House
 * The interior design brief: palette, room programme, and the notes that
 * appear in 房间手记 (room notes).
 *
 * A double storey semi-detached house, 30' x 48' built-up, designed in a warm
 * cream "Japandi" palette - oak, oat, clay and sage, with soft daylight.
 *
 * Coordinates in feet: x 0 (party wall) -> 30, z 0 (rear) -> 48 (street).
 */

export const FT = 0.3048;
export const ft = (v) => v * FT;

export const HOUSE = { width: 30, depth: 48, wallCut: 4.4, wallFull: 9.6, storey: 10.4 };

/** The palette every room is mixed from. */
export const TONE = {
  shell: '#f6f1e8',      // plaster
  shellWarm: '#efe7d9',
  oak: '#e0c9a6',        // floors
  oakDeep: '#c9a97e',
  oat: '#ecdcbe',
  sage: '#bcd1b0',
  clay: '#e9b394',
  butter: '#f6d98f',
  mist: '#b7d0dd',
  rose: '#f0c4c0',
  cream: '#fbf7f0',
  ink: '#4a4038',
  linen: '#f3ece1',
  moss: '#93a98a',
  terracotta: '#c98b6b',
  walnut: '#9a7550',
};

const GROUND = [
  {
    id: 'living', name: '客厅', en: 'Living Room', mood: '把下午的光，留在沙发上',
    x1: 0, z1: 22, x2: 19, z2: 40, accent: TONE.sage, floor: TONE.oak,
    note: '整面推拉门把庭院借进来，沙发不靠墙、留出一条回游动线。米白布艺 + 燕麦色羊毛地毯，电视墙做成整墙木饰面与开放格，把电器藏起来，只留下书与器物。',
    materials: ['橡木地板 Oak floor', '米白棉麻布艺 Linen upholstery', '藤编与陶器 Rattan & ceramic'],
    light: '主灯退场，落地灯 + 壁灯 + 灯带三层光',
    furniture: [
      { type: 'rug', x: 9, z: 31, w: 13, d: 10, color: TONE.oat },
      { type: 'sofa', x: 9, z: 35.5, rot: 180, w: 10, d: 3.4, color: '#efe9de' },
      { type: 'armchair', x: 3.2, z: 27.5, rot: 55, color: TONE.sage },
      { type: 'armchair', x: 15, z: 27.2, rot: -55, color: TONE.clay },
      { type: 'coffeeTable', x: 9, z: 31, w: 5, d: 2.6 },
      { type: 'tvWall', x: 9, z: 22.6, w: 12 },
      { type: 'floorLamp', x: 15.6, z: 35.5 },
      { type: 'plant', x: 1.6, z: 38, h: 5.2 },
      { type: 'plant', x: 17.4, z: 23.6, h: 3.4 },
      { type: 'sideTable', x: 2.4, z: 31.5 },
    ],
  },
  {
    id: 'dining', name: '餐厅', en: 'Dining', mood: '一张能坐很久的长桌',
    x1: 19, z1: 12, x2: 30, z2: 28, accent: TONE.clay, floor: TONE.oak,
    note: '长桌斜对着西厨中岛，做饭的人不会被隔开。头顶三盏小吊灯压低，饭桌之外的光都暗下去；侧墙做到顶的餐边柜，收纳全部日常杂物。',
    materials: ['实木长桌 Solid oak table', '藤编餐椅 Rattan chairs', '哑光陶砖 Matt tile'],
    light: '低垂吊灯三盏，2700K',
    furniture: [
      { type: 'rug', x: 24.5, z: 20, w: 9, d: 11, color: TONE.linen },
      { type: 'diningTable', x: 24.5, z: 20, w: 3.6, d: 8, chairs: 6 },
      { type: 'sideboard', x: 29, z: 20, rot: -90, w: 10, d: 1.6 },
      { type: 'pendant', x: 24.5, z: 20, count: 3, spread: 5 },
      { type: 'plant', x: 20.4, z: 26.6, h: 3.8 },
    ],
  },
  {
    id: 'kitchen', name: '西厨', en: 'Open Kitchen', mood: '中岛是家里第二张餐桌',
    x1: 0, z1: 12, x2: 11, z2: 22, accent: TONE.butter, floor: TONE.oakDeep,
    note: '开放式中岛正对餐厅，早餐、作业、聊天都在这里发生。上柜改成开放木层板，下柜做无把手；台面用米白石英石，耐用又不冷。',
    materials: ['米白石英石 Quartz top', '无把手木柜 Handleless oak', '手工砖墙面 Zellige tile'],
    light: '中岛吊灯 + 层板灯带',
    furniture: [
      { type: 'counter', x: 5.5, z: 12.9, rot: 0, w: 10, d: 2.1 },
      { type: 'counter', x: 0.9, z: 17, rot: 90, w: 8, d: 2.1 },
      { type: 'island', x: 6.4, z: 18.6, w: 8, d: 3, stools: 3 },
      { type: 'fridge', x: 10, z: 13.4 },
      { type: 'pendant', x: 6.4, z: 18.6, count: 2, spread: 3.4 },
    ],
  },
  {
    id: 'wetkitchen', name: '中厨', en: 'Wet Kitchen', mood: '大火与热气，关上门',
    x1: 0, z1: 0, x2: 11, z2: 12, accent: TONE.mist, floor: TONE.oakDeep,
    note: '爆炒的油烟留在玻璃门后。三面操作台形成 U 形动线，水槽对着后院的窗，洗菜时也能看见光。',
    materials: ['不锈钢台面 Stainless top', '长虹玻璃门 Fluted glass', '防滑地砖 Anti-slip tile'],
    light: '顶部平板灯，作业面灯带',
    furniture: [
      { type: 'counter', x: 5.5, z: 0.9, rot: 0, w: 10, d: 2.1 },
      { type: 'counter', x: 0.9, z: 6, rot: 90, w: 9, d: 2.1 },
      { type: 'counter', x: 10.1, z: 6, rot: -90, w: 9, d: 2.1 },
      { type: 'stove', x: 5.5, z: 1.1 },
      { type: 'plant', x: 9.4, z: 10.6, h: 2.6 },
    ],
  },
  {
    id: 'laundry', name: '洗衣房', en: 'Laundry', mood: '把家务藏进一扇门里',
    x1: 11, z1: 0, x2: 19, z2: 6, accent: TONE.oat, floor: TONE.oakDeep,
    note: '洗烘叠放，上方吊柜放清洁用品，留出一段挂烫的空档。门一关，杂乱与声音都留在里面。',
    materials: ['防潮板柜体 Moisture-proof cabinet', '水磨石地面 Terrazzo'],
    light: '一盏吸顶灯，够亮就好',
    furniture: [
      { type: 'washer', x: 12.6, z: 1.3 },
      { type: 'washer', x: 15.2, z: 1.3 },
      { type: 'counter', x: 17.4, z: 1.2, rot: 0, w: 3, d: 2 },
    ],
  },
  {
    id: 'powder', name: '客卫', en: 'Powder Room', mood: '给客人的小小体面',
    x1: 11, z1: 6, x2: 19, z2: 12, accent: TONE.mist, floor: TONE.oakDeep,
    note: '干湿分离，台盆下悬空显得轻。墙面用微水泥收边，配一面圆镜和一盏暖光壁灯。',
    materials: ['微水泥 Micro-cement', '圆形黑框镜 Round mirror'],
    light: '镜前壁灯，显色 Ra95',
    furniture: [
      { type: 'basin', x: 12.6, z: 10.6, rot: 180 },
      { type: 'toilet', x: 17.4, z: 7.6, rot: 90 },
      { type: 'shower', x: 17, z: 10.4 },
    ],
  },
  {
    id: 'study', name: '书房', en: 'Study', mood: '一个人待着的角落',
    x1: 19, z1: 0, x2: 30, z2: 12, accent: TONE.clay, floor: TONE.oak,
    note: '整墙书架 + 一张面窗的长桌。角落放下一张榻，家里来客时就是客房；白天是阅读位，夜里是床。',
    materials: ['白橡书架 White oak shelving', '亚麻窗帘 Linen curtain'],
    light: '桌面 LED 长灯，书架层板灯',
    furniture: [
      { type: 'bookshelf', x: 29.1, z: 6, rot: -90, w: 11, h: 7.5 },
      { type: 'desk', x: 24, z: 1.6, rot: 0, w: 7, d: 2.4 },
      { type: 'chair', x: 24, z: 3.6, rot: 180 },
      { type: 'daybed', x: 21, z: 9, rot: 90, w: 6, d: 3 },
      { type: 'plant', x: 20.2, z: 1.4, h: 3.6 },
    ],
  },
  {
    id: 'stair', name: '楼梯', en: 'Stairs', mood: '一层一层，回到楼上',
    x1: 11, z1: 12, x2: 19, z2: 22, accent: TONE.oat, floor: TONE.oakDeep,
    note: '木踏步配细黑铁扶手，侧面做成开放书格。楼梯下不做储藏，留空放一株高大的植物。',
    materials: ['橡木踏步 Oak tread', '细黑铁扶手 Slim steel rail'],
    light: '踏步侧灯带',
    furniture: [
      { type: 'staircase', x: 15, z: 17, w: 6, d: 10 },
    ],
  },
  {
    id: 'foyer', name: '玄关', en: 'Foyer', mood: '进门先放下今天',
    x1: 19, z1: 28, x2: 30, z2: 40, accent: TONE.oat, floor: TONE.oakDeep,
    note: '到顶鞋柜中间留出一段开放台面，钥匙、口罩、快递都有地方放。一条长凳可以坐下换鞋，镜子拉长走道。',
    materials: ['木饰面柜 Timber veneer', '六角地砖 Hex tile'],
    light: '柜底感应灯带',
    furniture: [
      { type: 'shoeCabinet', x: 29.1, z: 34, rot: -90, w: 10, h: 7.2 },
      { type: 'bench', x: 21.4, z: 33, rot: 90, w: 5 },
      { type: 'plant', x: 20.6, z: 29.4, h: 3.2 },
    ],
  },
  {
    id: 'porch', name: '停车与庭院', en: 'Porch & Garden', mood: '回家的最后二十步',
    x1: 0, z1: 40, x2: 30, z2: 48, accent: TONE.moss, floor: '#d8d2c6', open: true,
    note: '车位铺透水砖，中间嵌一条草缝。靠围墙种一排细叶植物，晚上用地埋灯打亮，回家时先看见绿。',
    materials: ['透水砖 Permeable paver', '细叶植栽 Fine-leaf planting'],
    light: '地埋灯 + 门头壁灯',
    furniture: [
      { type: 'car', x: 8, z: 44 },
      { type: 'car', x: 21, z: 44 },
      { type: 'plant', x: 27.6, z: 41.4, h: 4.4 },
      { type: 'plant', x: 1.8, z: 41.4, h: 4 },
    ],
  },
];

const UPPER = [
  {
    id: 'master', name: '主卧', en: 'Master Bedroom', mood: '做一个奶油色的梦',
    x1: 0, z1: 22, x2: 19, z2: 40, accent: TONE.rose, floor: TONE.oak,
    note: '床头做整幅软包，两侧对称壁灯，睡前不必下床关灯。窗边留一个 1.5 米的飘窗位，放坐垫和一张小几——这是房子里最安静的角落。',
    materials: ['米色软包床头 Upholstered headboard', '双层亚麻窗帘 Sheer + blackout'],
    light: '壁灯 + 灯带，主灯几乎不开',
    furniture: [
      { type: 'rug', x: 9, z: 30, w: 12, d: 9, color: TONE.linen },
      { type: 'bed', x: 9, z: 27.5, rot: 0, w: 7, d: 7.5 },
      { type: 'nightstand', x: 4.6, z: 24.6 },
      { type: 'nightstand', x: 13.4, z: 24.6 },
      { type: 'bench', x: 9, z: 32, rot: 0, w: 5 },
      { type: 'armchair', x: 16, z: 37, rot: -140, color: TONE.oat },
      { type: 'sideTable', x: 13.6, z: 37.6 },
      { type: 'plant', x: 1.8, z: 37.6, h: 4.2 },
      { type: 'floorLamp', x: 17.2, z: 34.6 },
    ],
  },
  {
    id: 'masterbath', name: '主卫', en: 'Master Bath', mood: '把浴缸放在窗边',
    x1: 19, z1: 26, x2: 30, z2: 40, accent: TONE.mist, floor: '#e6ded2',
    note: '独立浴缸靠窗，双台盆各自独立。淋浴区用长虹玻璃隔断，地面做 1% 找坡，水汽一会儿就散。',
    materials: ['微水泥墙面 Micro-cement', '独立浴缸 Freestanding tub', '长虹玻璃 Fluted glass'],
    light: '镜前灯 + 防雾筒灯',
    furniture: [
      { type: 'bathtub', x: 24.5, z: 38, rot: 0 },
      { type: 'basin', x: 29, z: 31, rot: -90 },
      { type: 'basin', x: 29, z: 34, rot: -90 },
      { type: 'shower', x: 20.8, z: 27.8 },
      { type: 'toilet', x: 24, z: 27.2, rot: 0 },
      { type: 'plant', x: 20.6, z: 38.4, h: 2.8 },
    ],
  },
  {
    id: 'walkin', name: '衣帽间', en: 'Walk-in Wardrobe', mood: '把衣服一件一件挂好',
    x1: 0, z1: 12, x2: 11, z2: 22, accent: TONE.oat, floor: TONE.oak,
    note: 'U 形开放衣柜，中间一个岛柜放首饰与香水。全部做到顶，顶层放换季收纳箱；柜内灯带随门感应。',
    materials: ['白橡层板 Oak shelving', '黄铜挂杆 Brass rail'],
    light: '感应灯带，显色优先',
    furniture: [
      { type: 'wardrobe', x: 0.9, z: 17, rot: 90, w: 9, h: 8 },
      { type: 'wardrobe', x: 10.1, z: 17, rot: -90, w: 9, h: 8 },
      { type: 'wardrobe', x: 5.5, z: 12.8, rot: 0, w: 8, h: 8 },
      { type: 'islandLow', x: 5.5, z: 18.4, w: 5, d: 2.4 },
    ],
  },
  {
    id: 'family', name: '家庭厅', en: 'Family Hall', mood: '一家人各做各的事',
    x1: 19, z1: 12, x2: 30, z2: 26, accent: TONE.sage, floor: TONE.oak,
    note: '不放电视，改成整墙书柜和一张大地毯。矮沙发 + 懒人豆袋，孩子在地上拼乐高，大人在旁边看书。',
    materials: ['羊毛地毯 Wool rug', '开放书柜 Open shelving'],
    light: '落地灯两盏，暖白',
    furniture: [
      { type: 'rug', x: 24.5, z: 19.5, w: 9, d: 10, color: TONE.sage },
      { type: 'sofa', x: 24.5, z: 15.4, rot: 0, w: 7, d: 3, color: TONE.linen },
      { type: 'bookshelf', x: 29.1, z: 21, rot: -90, w: 8, h: 7 },
      { type: 'ottoman', x: 22.4, z: 21.8 },
      { type: 'ottoman', x: 26.4, z: 22.6 },
      { type: 'floorLamp', x: 20.4, z: 13.4 },
    ],
  },
  {
    id: 'bed2', name: '次卧', en: 'Bedroom 2', mood: '给爸妈留的房间',
    x1: 0, z1: 0, x2: 12, z2: 12, accent: TONE.mist, floor: TONE.oak,
    note: '标准双人床 + 一体式书桌梳妆台。床垫偏硬，床头留双控开关和 USB；衣柜做到顶但不压床。',
    materials: ['白橡家具 Oak furniture', '素色亚麻 Plain linen'],
    light: '床头双控 + 阅读壁灯',
    furniture: [
      { type: 'bed', x: 5.6, z: 4, rot: 0, w: 6, d: 7 },
      { type: 'nightstand', x: 1.8, z: 1.4 },
      { type: 'nightstand', x: 9.4, z: 1.4 },
      { type: 'wardrobe', x: 11.1, z: 8, rot: -90, w: 7, h: 8 },
      { type: 'desk', x: 3, z: 10.8, rot: 180, w: 5, d: 2 },
      { type: 'plant', x: 10.4, z: 11.2, h: 2.8 },
    ],
  },
  {
    id: 'kids', name: '儿童房', en: "Kids' Room", mood: '地板要能坐下来玩',
    x1: 19, z1: 0, x2: 30, z2: 12, accent: TONE.butter, floor: TONE.oak,
    note: '床靠墙、家具沿边布置，中间留出最大的一块地面。矮书架让孩子自己拿得到书，墙面留一块洞洞板随他们贴。',
    materials: ['圆角实木家具 Rounded timber', '可擦洗墙漆 Washable paint'],
    light: '主灯柔光罩 + 小夜灯',
    furniture: [
      { type: 'bed', x: 22.6, z: 3.6, rot: 0, w: 4.6, d: 6.4 },
      { type: 'wardrobe', x: 29.1, z: 4, rot: -90, w: 7, h: 7.5 },
      { type: 'bookshelfLow', x: 25.6, z: 11.2, rot: 180, w: 5 },
      { type: 'rug', x: 25, z: 7.6, w: 7, d: 6, color: TONE.butter },
      { type: 'ottoman', x: 27.6, z: 8.6 },
      { type: 'plant', x: 19.8, z: 11.2, h: 2.6 },
    ],
  },
  {
    id: 'bath2', name: '公卫', en: 'Common Bath', mood: '早晨的第一件事',
    x1: 12, z1: 0, x2: 19, z2: 7, accent: TONE.mist, floor: '#e6ded2',
    note: '三分离：洗手台外置，马桶与淋浴各自成间。早上三个人可以同时用，不必排队。',
    materials: ['小白砖 Subway tile', '黑框玻璃门 Black-framed glass'],
    light: '防雾镜灯',
    furniture: [
      { type: 'basin', x: 13.6, z: 6.4, rot: 180 },
      { type: 'toilet', x: 17.6, z: 1.4, rot: 0 },
      { type: 'shower', x: 17.4, z: 5 },
    ],
  },
  {
    id: 'utility', name: '家政间', en: 'Utility', mood: '被子和毛巾的家',
    x1: 12, z1: 7, x2: 19, z2: 12, accent: TONE.oat, floor: TONE.oakDeep,
    note: '通高储物柜放四季床品与备用毛巾，最下一格留给吸尘器充电。',
    materials: ['三聚氰胺板 Melamine board'],
    light: '一盏筒灯',
    furniture: [
      { type: 'wardrobe', x: 18.1, z: 9.5, rot: -90, w: 4.6, h: 8 },
      { type: 'washer', x: 13.4, z: 8.4 },
    ],
  },
  {
    id: 'stairhall', name: '楼梯厅', en: 'Landing', mood: '走廊也值得一盏灯',
    x1: 11, z1: 12, x2: 19, z2: 22, accent: TONE.oat, floor: TONE.oakDeep,
    note: '楼梯口挂一组家庭照片墙，尽头放一张窄条案与一盏小灯，走廊就不只是走廊。',
    materials: ['照片墙 Gallery wall', '窄条案 Console'],
    light: '洗墙射灯',
    furniture: [
      { type: 'staircase', x: 15, z: 17, w: 6, d: 10, down: true },
      { type: 'sideboard', x: 11.8, z: 20, rot: 90, w: 4, d: 1.2 },
    ],
  },
  {
    id: 'balcony', name: '阳台', en: 'Balcony', mood: '晒被子的好天气',
    x1: 0, z1: 40, x2: 30, z2: 48, accent: TONE.moss, floor: '#ded7c9', open: true,
    note: '一半晾晒、一半喝茶。做一排固定花槽和两张折叠椅，栏杆用玻璃 + 木扶手，坐下时不挡视线。',
    materials: ['防腐木地板 Timber decking', '玻璃栏杆 Glass balustrade'],
    light: '壁灯 + 串灯',
    furniture: [
      { type: 'dryingRack', x: 7, z: 44 },
      { type: 'armchair', x: 20, z: 43.4, rot: 150, color: TONE.linen },
      { type: 'armchair', x: 24, z: 43.4, rot: -150, color: TONE.linen },
      { type: 'sideTable', x: 22, z: 45.4 },
      { type: 'plant', x: 27.4, z: 41.6, h: 3.4 },
      { type: 'plant', x: 16.6, z: 41.6, h: 2.8 },
    ],
  },
];

export const FLOORS = [
  { id: 'ground', name: '一层', en: 'Ground Floor', rooms: GROUND },
  { id: 'upper', name: '二层', en: 'First Floor', rooms: UPPER },
];

/**
 * Doors and openings. `axis` is the direction the opening runs, `at` is the
 * line it sits on: axis 'x' -> the wall at z = at, axis 'z' -> the wall at x = at.
 */
export const DOORS = {
  ground: [
    { axis: 'x', at: 12, from: 6.5, to: 9.5 },              // wet kitchen
    { axis: 'x', at: 12, from: 21, to: 27, wide: true },    // study -> dining
    { axis: 'z', at: 11, from: 2, to: 4.6 },                // laundry
    { axis: 'z', at: 11, from: 8, to: 10.4 },               // powder
    { axis: 'z', at: 11, from: 16, to: 20, wide: true },    // kitchen -> stair
    { axis: 'z', at: 19, from: 4, to: 7 },                  // study
    { axis: 'z', at: 19, from: 15, to: 19, wide: true },    // stair -> dining
    { axis: 'x', at: 22, from: 2, to: 9, wide: true },      // kitchen -> living
    { axis: 'x', at: 22, from: 12, to: 16 },                // stair -> living
    { axis: 'x', at: 28, from: 20, to: 28, wide: true },    // dining -> foyer
    { axis: 'z', at: 19, from: 30, to: 34 },                // foyer -> living
    { axis: 'x', at: 40, from: 3, to: 13, wide: true },     // living -> garden
    { axis: 'x', at: 40, from: 22, to: 25 },                // front door
  ],
  upper: [
    { axis: 'x', at: 12, from: 3, to: 6 },                  // bedroom 2
    { axis: 'x', at: 12, from: 13.5, to: 16 },              // utility
    { axis: 'x', at: 12, from: 21, to: 24 },                // kids
    { axis: 'x', at: 7, from: 14, to: 16.5 },               // common bath
    { axis: 'z', at: 11, from: 14, to: 17 },                // walk-in
    { axis: 'z', at: 19, from: 14, to: 18, wide: true },    // landing -> family
    { axis: 'x', at: 22, from: 4, to: 7 },                  // walk-in -> master
    { axis: 'x', at: 22, from: 12, to: 15.5 },              // landing -> master
    { axis: 'z', at: 19, from: 30, to: 33 },                // master -> master bath
    { axis: 'x', at: 40, from: 4, to: 12, wide: true },     // master -> balcony
  ],
};

/** Exterior windows. The wall on x = 0 is the party wall, so it has none. */
export const WINDOWS = {
  ground: [
    { axis: 'x', at: 0, from: 2, to: 8 },      // rear: wet kitchen
    { axis: 'x', at: 0, from: 21, to: 27 },    // rear: study
    { axis: 'z', at: 30, from: 2, to: 9 },     // side: study
    { axis: 'z', at: 30, from: 14, to: 26 },   // side: dining
    { axis: 'z', at: 30, from: 30, to: 38 },   // side: foyer
  ],
  upper: [
    { axis: 'x', at: 0, from: 2, to: 9 },      // rear: bedroom 2
    { axis: 'x', at: 0, from: 21, to: 28 },    // rear: kids
    { axis: 'z', at: 30, from: 2, to: 9 },     // side: kids
    { axis: 'z', at: 30, from: 14, to: 24 },   // side: family hall
    { axis: 'z', at: 30, from: 28, to: 38 },   // side: master bath
  ],
};

/** The two residents and what they are doing through the day. */
export const PEOPLE = [
  {
    id: 'he', name: '小禾', tint: '#8fae86',
    day: [
      { h: 6.5, floor: 'upper', room: 'master', act: '刚醒，在窗边发呆' },
      { h: 7.5, floor: 'upper', room: 'masterbath', act: '在浴室洗漱' },
      { h: 8.4, floor: 'ground', room: 'kitchen', act: '在中岛煮咖啡' },
      { h: 9.5, floor: 'ground', room: 'study', act: '在书房工作' },
      { h: 13, floor: 'ground', room: 'dining', act: '在长桌吃午饭' },
      { h: 15, floor: 'ground', room: 'study', act: '在书房看书' },
      { h: 18.5, floor: 'ground', room: 'wetkitchen', act: '在中厨做晚饭' },
      { h: 20, floor: 'ground', room: 'living', act: '在沙发上看电影' },
      { h: 22.5, floor: 'upper', room: 'master', act: '准备睡了' },
    ],
  },
  {
    id: 'man', name: '小满', tint: '#d3a07e',
    day: [
      { h: 6.5, floor: 'upper', room: 'kids', act: '还在睡回笼觉' },
      { h: 8, floor: 'upper', room: 'bath2', act: '在公卫刷牙' },
      { h: 8.6, floor: 'ground', room: 'dining', act: '准备在餐桌旁吃点心' },
      { h: 10, floor: 'upper', room: 'family', act: '在家庭厅拼乐高' },
      { h: 12.5, floor: 'ground', room: 'dining', act: '在长桌吃午饭' },
      { h: 14, floor: 'upper', room: 'balcony', act: '准备在阳台晒太阳' },
      { h: 17, floor: 'upper', room: 'kids', act: '在儿童房画画' },
      { h: 19, floor: 'ground', room: 'living', act: '在地毯上打滚' },
      { h: 21, floor: 'upper', room: 'kids', act: '听完故事睡着了' },
    ],
  },
];

export const WEATHER = [
  { id: 'sun', label: '晴', icon: '☀️' },
  { id: 'cloud', label: '多云', icon: '☁️' },
  { id: 'rain', label: '雨', icon: '🌧️' },
];
