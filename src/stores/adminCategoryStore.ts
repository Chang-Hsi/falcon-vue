import { defineStore } from "pinia";

export type CategoryLayout = "cards" | "table" | "compact";
export type ItemStatus = "enabled" | "disabled";
export type PageLayout = "split" | "kanban";

export type AdminCategory = {
  id: string;
  slug: string;
  label: string;
  order: number;
  status: ItemStatus;
  layout: CategoryLayout;
  fieldsPreset: string[];
  updatedAt: string;
};

export type CategoryItem = {
  id: string;
  name: string;
  categoryMain: string;
  categorySub: string;
  rating: number;
  distance: string;
  badge: string;
  coverUrl: string;
  status: ItemStatus;
  updatedAt: string;
};

type Filters = {
  keyword: string;
  status: "" | ItemStatus;
};

type SortKey = "name" | "rating" | "updatedAt" | "order" | "";
type SortDir = "asc" | "desc" | "";

type FrontCategory = { slug: string; label: string };

type FrontStore = {
  id: string;
  name: string;
  categoryMain: string;
  categorySub: string;
  rating: string | number;
  distance: string;
  badge: string;
  coverUrl: string;
};

type StoresBySlug = Record<string, FrontStore[]>;

function nowText(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${dd} ${hh}:${mm}`;
}

function includesCI(a: string, b: string): boolean {
  return String(a || "").toLowerCase().includes(String(b || "").toLowerCase());
}

function normalizeSlug(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function toNumberRating(v: string | number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isFinite(n)) return n;
  return 0;
}

/** 你的前台資料：categories + storesBySlug（原封不動搬進來） */
function buildFrontData(): { categories: FrontCategory[]; storesBySlug: StoresBySlug } {
  const categories: FrontCategory[] = [
    { slug: "food", label: "美味餐廳" },
    { slug: "daily", label: "生活雜貨" },
    { slug: "hotel", label: "飯店旅館" },
    { slug: "sport", label: "運動健身" },
    { slug: "beauty", label: "美容保養" },
    { slug: "coffee", label: "咖啡飲品" },
    { slug: "appliance", label: "家電" },
    { slug: "health", label: "保健醫療" },
    { slug: "storage", label: "傢俱收納" },
    { slug: "mobile", label: "手機相機" },
    { slug: "paper", label: "日用紙品" },
    { slug: "3c", label: "3C周邊" },
    { slug: "pet", label: "寵物用品" },
    { slug: "art", label: "圖藝" },
  ];

  const storesBySlug: StoresBySlug = {
    food: [
      {
        id: "food-1",
        name: "王品牛排 台北信義店",
        categoryMain: "美食",
        categorySub: "連鎖餐廳",
        rating: "4.5",
        distance: "1.2km",
        badge: "平日午餐9折優惠券",
        coverUrl:
          "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=900&fit=crop&q=90",
      },
      {
        id: "food-2",
        name: "築間幸福鍋物 中壢店",
        categoryMain: "美食",
        categorySub: "火鍋",
        rating: "4.4",
        distance: "0.9km",
        badge: "鍋物加料兌換券",
        coverUrl:
          "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1200&h=900&fit=crop&q=90",
      },
      {
        id: "food-3",
        name: "欣葉台菜 忠孝店",
        categoryMain: "美食",
        categorySub: "台菜",
        rating: "4.7",
        distance: "2.1km",
        badge: "指定套餐折扣券",
        coverUrl:
          "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&h=900&fit=crop&q=90",
      },
      {
        id: "food-4",
        name: "開飯川食堂 板橋店",
        categoryMain: "美食",
        categorySub: "川菜",
        rating: "4.3",
        distance: "3.0km",
        badge: "平日加菜券",
        coverUrl:
          "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=200&fit=crop",
      },
      {
        id: "food-5",
        name: "饗食天堂 京站店",
        categoryMain: "美食",
        categorySub: "吃到飽",
        rating: "4.2",
        distance: "2.8km",
        badge: "週末用餐折扣券",
        coverUrl:
          "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=900&fit=crop&q=90",
      },
      {
        id: "food-6",
        name: "麥當勞 西門町店",
        categoryMain: "美食",
        categorySub: "速食",
        rating: "4.1",
        distance: "1.6km",
        badge: "點心買一送一",
        coverUrl:
          "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=200&fit=crop",
      },
      {
        id: "food-7",
        name: "Subway 南京店",
        categoryMain: "美食",
        categorySub: "速食",
        rating: "4.0",
        distance: "1.1km",
        badge: "指定組合折扣",
        coverUrl:
          "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&h=900&fit=crop&q=90",
      },
      {
        id: "food-8",
        name: "必勝客 中山店",
        categoryMain: "美食",
        categorySub: "披薩",
        rating: "4.2",
        distance: "2.4km",
        badge: "外帶折扣券",
        coverUrl:
          "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=200&fit=crop",
      },
    ],

    daily: [
      {
        id: "daily-1",
        name: "寶雅 中山店",
        categoryMain: "生活百貨",
        categorySub: "連鎖商店",
        rating: "4.1",
        distance: "1.8km",
        badge: "滿額贈品兌換券",
        coverUrl:
          "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&h=200&fit=crop",
      },
      {
        id: "daily-2",
        name: "全聯 中壢中山店",
        categoryMain: "量販超市",
        categorySub: "連鎖超市",
        rating: "4.2",
        distance: "0.7km",
        badge: "生鮮折扣券",
        coverUrl:
          "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=300&h=200&fit=crop",
      },
      {
        id: "daily-3",
        name: "家樂福 桂林店",
        categoryMain: "量販超市",
        categorySub: "連鎖超市",
        rating: "4.0",
        distance: "2.7km",
        badge: "生鮮商品折扣券",
        coverUrl:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop",
      },
      {
        id: "daily-4",
        name: "MUJI 無印良品 信義店",
        categoryMain: "生活百貨",
        categorySub: "居家生活",
        rating: "4.4",
        distance: "1.9km",
        badge: "會員限定折扣",
        coverUrl:
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&h=200&fit=crop",
      },
      {
        id: "daily-5",
        name: "IKEA 新莊店",
        categoryMain: "生活百貨",
        categorySub: "居家生活",
        rating: "4.3",
        distance: "3.6km",
        badge: "指定商品折扣",
        coverUrl:
          "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300&h=200&fit=crop",
      },
      {
        id: "daily-6",
        name: "NET 西門門市",
        categoryMain: "服飾配件",
        categorySub: "服飾店",
        rating: "4.2",
        distance: "2.3km",
        badge: "新品上市優惠券",
        coverUrl:
          "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=200&fit=crop",
      },
      {
        id: "daily-7",
        name: "UNIQLO 信義旗艦店",
        categoryMain: "服飾配件",
        categorySub: "服飾店",
        rating: "4.5",
        distance: "1.6km",
        badge: "限時特價優惠券",
        coverUrl:
          "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&h=200&fit=crop",
      },
      {
        id: "daily-8",
        name: "SOGO 忠孝館",
        categoryMain: "百貨商場",
        categorySub: "百貨公司",
        rating: "4.6",
        distance: "1.3km",
        badge: "週年慶滿額禮券",
        coverUrl:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=900&fit=crop&q=90",
      },
    ],

    hotel: [
      {
        id: "hotel-1",
        name: "城市商旅 台北南東館",
        categoryMain: "住宿",
        categorySub: "商務旅館",
        rating: "4.3",
        distance: "2.2km",
        badge: "平日住宿折扣",
        coverUrl: "https://i.pinimg.com/736x/49/33/19/4933196304e8e62bf27d8ff943329374.jpg",
      },
      {
        id: "hotel-2",
        name: "和苑旅店 西門館",
        categoryMain: "住宿",
        categorySub: "飯店旅館",
        rating: "4.5",
        distance: "2.9km",
        badge: "加贈早餐券",
        coverUrl: "https://i.pinimg.com/1200x/3f/5f/ae/3f5fae7069f96e9a4fb40e094a16c2f6.jpg",
      },
      {
        id: "hotel-3",
        name: "青年旅館 中正館",
        categoryMain: "住宿",
        categorySub: "青年旅館",
        rating: "4.1",
        distance: "1.4km",
        badge: "連住優惠",
        coverUrl: "https://i.pinimg.com/1200x/7f/2b/5f/7f2b5fabeb96123b73a047a62f9b4772.jpg",
      },
    ],

    sport: [
      {
        id: "sport-1",
        name: "健身工廠 內湖旗艦店",
        categoryMain: "運動健身",
        categorySub: "健身中心",
        rating: "4.4",
        distance: "3.2km",
        badge: "首月入會優惠券",
        coverUrl: "https://i.pinimg.com/736x/bf/a8/d9/bfa8d96fd0caa4799994bab2351ce709.jpg",
      },
      {
        id: "sport-2",
        name: "World Gym 中壢店",
        categoryMain: "運動健身",
        categorySub: "健身中心",
        rating: "4.2",
        distance: "1.8km",
        badge: "體驗課程折扣",
        coverUrl: "https://i.pinimg.com/1200x/d3/45/96/d34596e09f22bfed17e04cc66dbe1a36.jpg",
      },
      {
        id: "sport-3",
        name: "瑜珈教室 信義館",
        categoryMain: "運動健身",
        categorySub: "瑜珈",
        rating: "4.6",
        distance: "2.5km",
        badge: "首次課程優惠",
        coverUrl: "https://i.pinimg.com/736x/6a/df/85/6adf852f8757572e1a7ddc8d230d6594.jpg",
      },
    ],

    beauty: [
      {
        id: "beauty-1",
        name: "屈臣氏 忠孝復興門市",
        categoryMain: "美妝保養",
        categorySub: "連鎖藥妝",
        rating: "4.3",
        distance: "0.8km",
        badge: "滿千送百購物金",
        coverUrl: "https://i.pinimg.com/1200x/4c/a0/a2/4ca0a2b38db4f6a5d8ad88d50a4bdc66.jpg",
      },
      {
        id: "beauty-2",
        name: "康是美 南京店",
        categoryMain: "藥妝保健",
        categorySub: "連鎖藥妝",
        rating: "4.3",
        distance: "0.9km",
        badge: "會員獨享折扣券",
        coverUrl: "https://i.pinimg.com/1200x/33/65/6d/33656d4a665c82ec83c97de6e84721c5.jpg",
      },
      {
        id: "beauty-3",
        name: "SPA 會館 大安店",
        categoryMain: "美容美髮",
        categorySub: "SPA按摩",
        rating: "4.6",
        distance: "1.1km",
        badge: "按摩體驗折扣券",
        coverUrl: "https://i.pinimg.com/1200x/a6/20/4c/a6204caaa428f79760d310d0d9b301b7.jpg",
      },
    ],

    coffee: [
      {
        id: "coffee-1",
        name: "星巴克 南京東路店",
        categoryMain: "咖啡飲品",
        categorySub: "連鎖咖啡",
        rating: "4.4",
        distance: "0.6km",
        badge: "中杯咖啡兌換券",
        coverUrl: "https://i.pinimg.com/736x/cc/32/48/cc32481f44aedc6161f4514aa51e86ed.jpg",
      },
      {
        id: "coffee-2",
        name: "85度C 南京東路店",
        categoryMain: "咖啡飲品",
        categorySub: "連鎖咖啡",
        rating: "4.4",
        distance: "0.5km",
        badge: "指定商品買一送一",
        coverUrl: "https://i.pinimg.com/736x/62/b9/e9/62b9e9d34f137842079d064a52294f15.jpg",
      },
      {
        id: "coffee-3",
        name: "旬日咖啡 中壢店",
        categoryMain: "咖啡飲品",
        categorySub: "咖啡廳",
        rating: "4.5",
        distance: "1.0km",
        badge: "甜點加購折扣",
        coverUrl: "https://i.pinimg.com/736x/c2/d2/89/c2d289a1189468670126b78d2be54ea5.jpg",
      },
    ],

    appliance: [
      {
        id: "appliance-1",
        name: "燦坤 3C 中壢店",
        categoryMain: "家電",
        categorySub: "3C電器",
        rating: "4.1",
        distance: "1.2km",
        badge: "會員滿額折扣",
        coverUrl: "https://i.pinimg.com/736x/7f/2e/af/7f2eafb373ac145b7332b5a119434d5c.jpg",
      },
      {
        id: "appliance-2",
        name: "全國電子 桃園店",
        categoryMain: "家電",
        categorySub: "家電賣場",
        rating: "4.0",
        distance: "2.9km",
        badge: "指定家電折扣券",
        coverUrl: "https://i.pinimg.com/736x/b1/b7/02/b1b7027b49c55c3c89ba3a97f05ac3a2.jpg",
      },
    ],

    health: [
      {
        id: "health-1",
        name: "大樹藥局 中壢店",
        categoryMain: "保健醫療",
        categorySub: "藥局",
        rating: "4.2",
        distance: "0.9km",
        badge: "保健品折扣券",
        coverUrl: "https://i.pinimg.com/736x/7c/60/f6/7c60f667a04023692e10f509e38b514f.jpg",
      },
      {
        id: "health-2",
        name: "健康檢查中心 內科門診",
        categoryMain: "保健醫療",
        categorySub: "診所",
        rating: "4.1",
        distance: "3.3km",
        badge: "健檢加值優惠",
        coverUrl: "https://i.pinimg.com/736x/00/29/41/002941d067a4c512b059722ca485a751.jpg",
      },
    ],

    storage: [
      {
        id: "storage-1",
        name: "IKEA 新莊店",
        categoryMain: "傢俱收納",
        categorySub: "傢俱",
        rating: "4.3",
        distance: "3.6km",
        badge: "收納用品折扣",
        coverUrl: "https://i.pinimg.com/736x/47/64/3b/47643bacbe949479611916ce12c64f9b.jpg",
      },
      {
        id: "storage-2",
        name: "收納職人 生活館",
        categoryMain: "傢俱收納",
        categorySub: "收納",
        rating: "4.4",
        distance: "2.0km",
        badge: "滿額贈收納盒",
        coverUrl: "https://i.pinimg.com/1200x/a8/00/46/a800461e49c46775e625f04c728bdfcc.jpg",
      },
    ],

    mobile: [],
    paper: [],

    "3c": [
      {
        id: "3c-1",
        name: "Apple 授權維修中心",
        categoryMain: "3C周邊",
        categorySub: "維修服務",
        rating: "4.4",
        distance: "1.7km",
        badge: "配件折扣券",
        coverUrl: "https://i.pinimg.com/736x/70/7b/67/707b67618a418dd21e96c09be2123cab.jpg",
      },
      {
        id: "3c-2",
        name: "相機包 / 充電線 生活館",
        categoryMain: "3C周邊",
        categorySub: "配件",
        rating: "4.2",
        distance: "2.6km",
        badge: "指定商品折扣",
        coverUrl: "https://i.pinimg.com/736x/ad/8e/b2/ad8eb2630c286269addac1eb4cf8ef1f.jpg",
      },
    ],

    pet: [
      {
        id: "pet-1",
        name: "毛孩生活館",
        categoryMain: "寵物用品",
        categorySub: "寵物店",
        rating: "4.6",
        distance: "1.3km",
        badge: "飼料折扣券",
        coverUrl: "https://i.pinimg.com/1200x/db/fd/72/dbfd7257188c98bf4a5ec93ffb57fe71.jpg",
      },
      {
        id: "pet-2",
        name: "寵物美容沙龍",
        categoryMain: "寵物用品",
        categorySub: "美容",
        rating: "4.5",
        distance: "2.1km",
        badge: "洗澡美容優惠",
        coverUrl: "https://i.pinimg.com/1200x/7a/03/08/7a030843c78a80c4438eef9791bf4887.jpg",
      },
    ],

    art: [],
  };

  return { categories, storesBySlug };
}

function buildAdminInitialState() {
  const front = buildFrontData();

  const categories: AdminCategory[] = front.categories.map((c, i) => ({
    id: `c_${c.slug}`,
    slug: c.slug,
    label: c.label,
    order: i + 1,
    status: "enabled",
    layout: i % 2 === 0 ? "cards" : "table",
    fieldsPreset:
      i % 2 === 0
        ? ["name", "categorySub", "rating", "distance", "badge", "status", "updatedAt"]
        : ["name", "categoryMain", "categorySub", "rating", "badge", "status", "updatedAt"],
    updatedAt: nowText(),
  }));

  const itemsById: Record<string, CategoryItem> = {};
  const categoryItemIds: Record<string, string[]> = {};

  for (const cat of categories) {
    categoryItemIds[cat.id] = [];
  }

  for (const [slug, list] of Object.entries(front.storesBySlug)) {
    const catId = `c_${slug}`;
    if (!categoryItemIds[catId]) categoryItemIds[catId] = [];

    for (const s of list) {
      const id = String(s.id || "").trim();
      if (!id) continue;

      const item: CategoryItem = {
        id,
        name: String(s.name || "").trim(),
        categoryMain: String(s.categoryMain || "").trim(),
        categorySub: String(s.categorySub || "").trim(),
        rating: toNumberRating(s.rating),
        distance: String(s.distance || "").trim(),
        badge: String(s.badge || "").trim(),
        coverUrl: String(s.coverUrl || "").trim(),
        status: "enabled",
        updatedAt: nowText(),
      };

      itemsById[id] = item;
      categoryItemIds[catId].push(id);
    }
  }

  const activeCategoryId = categories[0]?.id || "";

  return { categories, itemsById, categoryItemIds, activeCategoryId };
}

export const useAdminCategoryStore = defineStore("adminCategoryStore", {
  state: () => {
    const init = buildAdminInitialState();

    return {
      categories: init.categories,
      itemsById: init.itemsById,
      categoryItemIds: init.categoryItemIds,

      pageLayout: "split" as PageLayout,
      activeCategoryId: init.activeCategoryId,
      selection: [] as string[],
      filters: { keyword: "", status: "" } as Filters,
      sort: { key: "order" as SortKey, dir: "asc" as SortDir },

      page: 1,
      pageSize: 10,
    };
  },

  getters: {
    categoryMap(state): Record<string, AdminCategory> {
      const map: Record<string, AdminCategory> = {};
      for (const c of state.categories) map[c.id] = c;
      return map;
    },

    sortedCategories(state): AdminCategory[] {
      return state.categories.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    activeCategory(state): AdminCategory | null {
      return state.categories.find((c) => c.id === state.activeCategoryId) || null;
    },

    activeItemIds(state): string[] {
      const cid = state.activeCategoryId;
      if (!cid) return [];
      const ids = state.categoryItemIds[cid];
      return Array.isArray(ids) ? ids : [];
    },

    activeItems(state): CategoryItem[] {
      const ids = this.activeItemIds;
      const out: CategoryItem[] = [];
      for (const id of ids) {
        const it = state.itemsById[id];
        if (it) out.push(it);
      }
      return out;
    },

    filteredActiveItems(state): CategoryItem[] {
      const kw = String(state.filters.keyword || "").trim();
      const st = state.filters.status;

      let arr = this.activeItems.slice();

      if (kw) {
        arr = arr.filter((x) => includesCI(x.name, kw) || includesCI(x.id, kw));
      }

      if (st) {
        arr = arr.filter((x) => x.status === st);
      }

      const key = state.sort.key;
      const dir = state.sort.dir;

      if (key && dir && key !== "order") {
        const factor = dir === "asc" ? 1 : -1;
        arr.sort((a, b) => {
          let va: string | number = 0;
          let vb: string | number = 0;

          if (key === "name") {
            va = a.name;
            vb = b.name;
          } else if (key === "rating") {
            va = a.rating;
            vb = b.rating;
          } else if (key === "updatedAt") {
            va = a.updatedAt;
            vb = b.updatedAt;
          }

          if (typeof va === "string" && typeof vb === "string") {
            return va.localeCompare(vb) * factor;
          }
          return (Number(va) - Number(vb)) * factor;
        });
      }

      return arr;
    },

    pageCount(state): number {
      const total = this.filteredActiveItems.length;
      const size = Math.max(1, Number(state.pageSize) || 10);
      return Math.max(1, Math.ceil(total / size));
    },

    pageItems(state): CategoryItem[] {
      const p = Math.min(Math.max(1, Number(state.page) || 1), this.pageCount);
      const size = Math.max(1, Number(state.pageSize) || 10);
      const start = (p - 1) * size;
      const end = start + size;
      return this.filteredActiveItems.slice(start, end);
    },

    isSelected(state) {
      return (id: string): boolean => state.selection.includes(id);
    },

    isAllSelectedOnPage(state): boolean {
      const ids = this.pageItems.map((x) => x.id);
      if (!ids.length) return false;
      return ids.every((id) => state.selection.includes(id));
    },
  },

  actions: {
    setActiveCategory(id: string) {
      this.activeCategoryId = String(id || "");
      this.page = 1;
      this.selection = [];
    },

    createCategory(payload: { slug: string; label: string }) {
      const slug = normalizeSlug(payload.slug);
      const id = `c_${slug}`;
      const exists = this.categories.some((c) => c.id === id || c.slug === slug);
      if (exists) throw new Error("分類 slug 已存在");

      const maxOrder = Math.max(0, ...this.categories.map((c) => Number(c.order) || 0));

      const next: AdminCategory = {
        id,
        slug,
        label: String(payload.label || "").trim(),
        order: maxOrder + 1,
        status: "enabled",
        layout: "cards",
        fieldsPreset: ["name", "categorySub", "rating", "distance", "badge", "status", "updatedAt"],
        updatedAt: nowText(),
      };

      this.categories.push(next);
      this.categoryItemIds[id] = [];
      this.activeCategoryId = id;
      this.page = 1;
      this.selection = [];
    },

    updateCategory(id: string, patch: Partial<AdminCategory>) {
      const idx = this.categories.findIndex((c) => c.id === id);
      if (idx < 0) return;
      const prev = this.categories[idx];
      if (!prev) return;

      const next: AdminCategory = { ...prev, ...patch, updatedAt: nowText() };
      this.categories.splice(idx, 1, next);
    },

    removeCategory(id: string) {
      const target = String(id || "");
      if (!target) return;

      delete this.categoryItemIds[target];
      this.categories = this.categories.filter((c) => c.id !== target);

      const sorted = this.sortedCategories;
      sorted.forEach((c, i) => {
        this.updateCategory(c.id, { order: i + 1 });
      });

      if (this.activeCategoryId === target) {
        this.activeCategoryId = this.sortedCategories[0]?.id || "";
      }

      this.page = 1;
      this.selection = [];
    },

        // ===== 新增：拖拽排序（分類）=====
    reorderCategoriesByIds(orderedIds: string[]) {
      const ids = Array.isArray(orderedIds) ? orderedIds.map((x) => String(x || "")) : [];
      if (!ids.length) return;

      const all = this.categories.map((c) => c.id);
      if (ids.length !== all.length) return;

      const set = new Set(ids);
      if (all.some((id) => !set.has(id))) return;

      const map: Record<string, AdminCategory> = {};
      this.categories.forEach((c) => {
        map[c.id] = c;
      });

      const next: AdminCategory[] = ids
        .map((id, idx) => {
          const prev = map[id];
          if (!prev) return null;
          const updated: AdminCategory = { ...prev, order: idx + 1, updatedAt: nowText() };
          return updated;
        })
        .filter((x): x is AdminCategory => Boolean(x));

      this.categories = next;
    },

    // ===== 新增：拖拽排序（內容：依 categoryItemIds 的順序）=====
    reorderActiveItemIds(orderedIds: string[]) {
      const cid = this.activeCategoryId;
      if (!cid) return;

      const nextIds = Array.isArray(orderedIds) ? orderedIds.map((x) => String(x || "")) : [];
      const currIds = Array.isArray(this.categoryItemIds[cid]) ? this.categoryItemIds[cid].slice() : [];

      if (!nextIds.length) return;
      if (nextIds.length !== currIds.length) return;

      const set = new Set(currIds);
      if (nextIds.some((id) => !set.has(id))) return;

      this.categoryItemIds[cid] = nextIds.slice();

      // 讓分類 updatedAt 有更新（表示這個分類的排序被改過）
      this.updateCategory(cid, {});
    },


    /** ✅ 新增內容：自動產生不重複 id（避免跟前台 seed 撞 id） */
    createItemToActiveCategory(payload: Omit<CategoryItem, "id" | "updatedAt">) {
      const cid = this.activeCategoryId;
      if (!cid) return;

      const baseSlug = this.activeCategory?.slug || "item";
      const id = `${baseSlug}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

      const next: CategoryItem = {
        ...payload,
        id,
        updatedAt: nowText(),
      };

      this.itemsById[id] = next;

      const ids = Array.isArray(this.categoryItemIds[cid]) ? this.categoryItemIds[cid] : [];
      ids.push(id);
      this.categoryItemIds[cid] = ids;
    },

    addItemToActiveCategory(item: CategoryItem) {
      const cid = this.activeCategoryId;
      if (!cid) return;

      const next: CategoryItem = { ...item, updatedAt: nowText() };
      this.itemsById[item.id] = next;

      const ids = Array.isArray(this.categoryItemIds[cid]) ? this.categoryItemIds[cid] : [];
      if (!ids.includes(item.id)) {
        ids.push(item.id);
        this.categoryItemIds[cid] = ids;
      }
    },

    updateItem(id: string, patch: Partial<CategoryItem>) {
      const prev = this.itemsById[id];
      if (!prev) return;
      this.itemsById[id] = { ...prev, ...patch, updatedAt: nowText() };
    },

    removeItemFromActiveCategory(id: string) {
      const cid = this.activeCategoryId;
      if (!cid) return;

      const ids = Array.isArray(this.categoryItemIds[cid]) ? this.categoryItemIds[cid] : [];
      this.categoryItemIds[cid] = ids.filter((x) => x !== id);
      this.selection = this.selection.filter((x) => x !== id);
    },

    toggleSelect(id: string) {
      const target = String(id || "");
      if (!target) return;

      const idx = this.selection.indexOf(target);
      if (idx >= 0) this.selection.splice(idx, 1);
      else this.selection.push(target);
    },

    toggleSelectAllOnPage() {
      const ids = this.pageItems.map((x) => x.id);
      if (!ids.length) return;

      if (this.isAllSelectedOnPage) {
        this.selection = this.selection.filter((id) => !ids.includes(id));
        return;
      }

      const set = new Set(this.selection);
      ids.forEach((id) => set.add(id));
      this.selection = Array.from(set);
    },

    clearSelection() {
      this.selection = [];
    },

    moveItemToCategory(itemId: string, fromCategoryId: string, toCategoryId: string) {
      if (!fromCategoryId || !toCategoryId) return;
      if (fromCategoryId === toCategoryId) return;

      const fromIds = Array.isArray(this.categoryItemIds[fromCategoryId])
        ? this.categoryItemIds[fromCategoryId]
        : [];
      const toIds = Array.isArray(this.categoryItemIds[toCategoryId])
        ? this.categoryItemIds[toCategoryId]
        : [];

      this.categoryItemIds[fromCategoryId] = fromIds.filter((x) => x !== itemId);

      if (!toIds.includes(itemId)) {
        toIds.push(itemId);
        this.categoryItemIds[toCategoryId] = toIds;
      }
    },

    bulkMoveSelected(toCategoryId: string) {
      const fromCategoryId = this.activeCategoryId;
      if (!fromCategoryId) return;

      const ids = this.selection.slice();
      ids.forEach((itemId) => {
        this.moveItemToCategory(itemId, fromCategoryId, toCategoryId);
      });

      this.selection = [];
    },

    setFilters(payload: Partial<Filters>) {
      this.filters = { ...this.filters, ...payload };
      this.page = 1;
      this.selection = [];
    },

    resetFilters() {
      this.filters = { keyword: "", status: "" };
      this.page = 1;
      this.selection = [];
    },

    setPage(p: number) {
      const next = Math.min(Math.max(1, Number(p) || 1), this.pageCount);
      this.page = next;
    },

    setPageSize(n: number) {
      const size = Math.max(1, Number(n) || 10);
      this.pageSize = size;
      this.page = 1;
    },

    toggleSort(key: SortKey) {
      if (!key) return;

      if (this.sort.key !== key) {
        this.sort = { key, dir: "asc" };
        this.page = 1;
        return;
      }

      if (this.sort.dir === "asc") {
        this.sort = { key, dir: "desc" };
        this.page = 1;
        return;
      }

      this.sort = { key: "order", dir: "asc" };
      this.page = 1;
    },
  },
});
