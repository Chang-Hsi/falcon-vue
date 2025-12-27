import { defineStore } from "pinia";

export type DealStatus = "enabled" | "disabled";

export type AdminDeal = {
  id: string;
  name: string;

  status: DealStatus;
  isFeatured: boolean;

  categoryMainId: string;
  categorySubId: string;

  rating: number;
  distanceText: string; // "0.5km"
  badge: string;

  coverUrl: string;

  // 詳細
  hoursText: string;
  phone: string;
  addressText: string;
  imageUrl: string;

  introParagraphs: string[];
  rules: string[];

  stats: {
    dealCount: number;
    ticketCount: number;
  };

  updatedAt: string; // yyyy-mm-dd HH:mm
};

export type Category = { id: string; label: string };

type Filters = {
  keyword: string;
  status: "" | DealStatus;
  categoryMainId: string;
  categorySubId: string;
  featuredOnly: boolean;
};

type SortDir = "asc" | "desc" | "";
type SortKey =
  | "name"
  | "rating"
  | "distance"
  | "dealCount"
  | "ticketCount"
  | "status"
  | "updatedAt"
  | "";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateTime(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${y}-${m}-${dd} ${hh}:${mm}`;
}

function seededNumber(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const r = h % 10000;
  const t = r / 9999;
  return Math.floor(min + t * (max - min));
}

function includesCI(a: string, b: string) {
  return String(a || "").toLowerCase().includes(String(b || "").toLowerCase());
}

function normalizeStatusOrder(s: DealStatus) {
  return s === "enabled" ? 0 : 1;
}

function parseDistanceKm(distanceText: string) {
  // 支援 "0.5km" / "1.2 km" / "500m"
  const t = String(distanceText || "").trim().toLowerCase();
  if (!t) return Number.POSITIVE_INFINITY;

  if (t.includes("km")) {
    const num = parseFloat(t.replace("km", "").trim());
    return Number.isFinite(num) ? num : Number.POSITIVE_INFINITY;
  }

  if (t.includes("m")) {
    const num = parseFloat(t.replace("m", "").trim());
    return Number.isFinite(num) ? num / 1000 : Number.POSITIVE_INFINITY;
  }

  const num = parseFloat(t);
  return Number.isFinite(num) ? num : Number.POSITIVE_INFINITY;
}

export const useAdminDealStore = defineStore("adminDealStore", {
  state: () => {
    // ===== 分類（主/子）=====
    const categoryMain: Category[] = [
      { id: "food", label: "美食" },
      { id: "coffee", label: "咖啡飲品" },
      { id: "beauty", label: "美妝保養" },
      { id: "drug", label: "藥妝保健" },
      { id: "book", label: "書籍文具" },
      { id: "fashion", label: "服飾配件" },
      { id: "daily", label: "生活百貨" },
      { id: "mall", label: "百貨商場" },
      { id: "market", label: "量販超市" },
      { id: "sport", label: "運動健身" },
      { id: "dessert", label: "冰品甜點" },
    ];

    const categorySubMap: Record<string, Category[]> = {
      food: [
        { id: "chain-restaurant", label: "連鎖餐廳" },
        { id: "steak", label: "牛排餐廳" },
        { id: "hotpot", label: "火鍋" },
      ],
      coffee: [
        { id: "chain-coffee", label: "連鎖咖啡" },
        { id: "cafe", label: "咖啡館" },
      ],
      beauty: [{ id: "chain-cosmetic", label: "連鎖藥妝" }],
      drug: [{ id: "chain-pharmacy", label: "連鎖藥妝" }],
      book: [{ id: "chain-bookstore", label: "連鎖書店" }],
      fashion: [{ id: "clothing-store", label: "服飾店" }],
      daily: [{ id: "chain-store", label: "連鎖商店" }],
      mall: [{ id: "department-store", label: "百貨公司" }],
      market: [{ id: "chain-supermarket", label: "連鎖超市" }],
      sport: [{ id: "gym", label: "健身中心" }],
      dessert: [{ id: "icecream", label: "冰淇淋" }],
    };

    const mainLabelToId: Record<string, string> = Object.fromEntries(
      categoryMain.map((c) => [c.label, c.id])
    );

    const subLabelToId: Record<string, string> = {};
    for (const mainId of Object.keys(categorySubMap)) {
      const subs = categorySubMap[mainId] ?? [];
      for (const sub of subs) {
        subLabelToId[`${mainId}__${sub.label}`] = sub.id;
      }
    }

    // ===== 你提供的 stores（列表）=====
    const rawStores = [
      {
        id: "s1",
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
        id: "s2",
        name: "屈臣氏 忠孝復興門市",
        categoryMain: "美妝保養",
        categorySub: "連鎖藥妝",
        rating: "4.3",
        distance: "0.8km",
        badge: "滿千送百購物金",
        coverUrl:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop",
      },
      {
        id: "s3",
        name: "誠品書店 信義旗艦店",
        categoryMain: "書籍文具",
        categorySub: "連鎖書店",
        rating: "4.7",
        distance: "1.5km",
        badge: "會員專屬折價券",
        coverUrl:
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=200&fit=crop",
      },
      {
        id: "s4",
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
        id: "s5",
        name: "85度C 南京東路店",
        categoryMain: "咖啡飲品",
        categorySub: "連鎖咖啡",
        rating: "4.4",
        distance: "0.5km",
        badge: "指定商品買一送一",
        coverUrl:
          "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&h=200&fit=crop",
      },
      {
        id: "s6",
        name: "寶雅 中山店",
        categoryMain: "生活百貨",
        categorySub: "連鎖商店",
        rating: "4.1",
        distance: "1.8km",
        badge: "滿額贈品兌換券",
        coverUrl:
          "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=300&h=200&fit=crop&q=90",
      },
      {
        id: "s7",
        name: "SOGO 忠孝館",
        categoryMain: "百貨商場",
        categorySub: "百貨公司",
        rating: "4.6",
        distance: "1.3km",
        badge: "週年慶滿額禮券",
        coverUrl:
          "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&h=200&fit=crop",
      },
      {
        id: "s8",
        name: "家樂福 桂林店",
        categoryMain: "量販超市",
        categorySub: "連鎖超市",
        rating: "4.0",
        distance: "2.7km",
        badge: "生鮮商品折扣券",
        coverUrl:
          "https://images.unsplash.com/photo-1601598851547-4302969d0614?w=300&h=200&fit=crop",
      },
      {
        id: "s9",
        name: "Uniqlo 信義旗艦店",
        categoryMain: "服飾配件",
        categorySub: "服飾店",
        rating: "4.5",
        distance: "1.6km",
        badge: "限時特價優惠券",
        coverUrl:
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop",
      },
      {
        id: "s10",
        name: "莫凡彼 微風廣場店",
        categoryMain: "冰品甜點",
        categorySub: "冰淇淋",
        rating: "4.8",
        distance: "1.1km",
        badge: "VIP點數回饋券",
        coverUrl:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop&q=90",
      },
      {
        id: "s11",
        name: "健身工廠 內湖旗艦店",
        categoryMain: "運動健身",
        categorySub: "健身中心",
        rating: "4.4",
        distance: "3.2km",
        badge: "首月入會優惠券",
        coverUrl:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop",
      },
      {
        id: "s12",
        name: "康是美 南京店",
        categoryMain: "藥妝保健",
        categorySub: "連鎖藥妝",
        rating: "4.3",
        distance: "0.9km",
        badge: "會員獨享折扣券",
        coverUrl:
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
      },
    ];

    // ===== 單店 vm（你提供的那一筆詳細資料，對應 s5）=====
    const vmDetail = {
      title: "85度C 南京東路店",
      categoryMain: "咖啡飲品",
      categorySub: "連鎖咖啡",
      rating: 4.4,
      distance: "0.5km",
      hours: "週一至週日 11:00-22:00",
      phone: "02-2345-6789",
      address: "台北市信義區信義路五段7號",
      imageUrl:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&h=800&fit=crop&q=90",
      introParagraphs: [
        "王品牛排創立於1993年，秉持「只款待心中最重要的人」的品牌精神，為每一位貴賓提供最頂級的用餐體驗。我們嚴選 prime 等級牛肉，搭配主廚特製醬汁，呈現最完美的口感與風味。",
        "台北信義店位於信義商圈核心地帶，擁有寬敞舒適的用餐環境與專業親切的服務團隊。無論是商務宴請、家庭聚餐或浪漫約會，我們都能為您打造難忘的美食時光。",
        "店內提供完整的套餐服務，包含精緻沙拉吧、主廚湯品、主餐、甜點及飲品。每一道菜餚都經過嚴格品管，確保食材新鮮與烹調火候，讓您享受五星級的餐宴體驗。",
      ],
      rules: [
        "請於消費前出示優惠券給店員確認",
        "每人每次限用一張優惠券",
        "本優惠不得與其他優惠併用",
        "優惠券使用前請先電話預約訂位",
        "特殊節日（春節、情人節、母親節等）可能不適用",
        "店家保留活動修改、暫停或終止之權利",
        "詳細使用規範以現場公告為準",
      ],
    };

    function updatedAtFor(id: string) {
      const daysAgo = seededNumber(id + "_d", 0, 30);
      const hoursAgo = seededNumber(id + "_h", 0, 23);
      const minutesAgo = seededNumber(id + "_m", 0, 59);
      const now = new Date();
      const d = new Date(
        now.getTime() - (daysAgo * 24 * 60 + hoursAgo * 60 + minutesAgo) * 60 * 1000
      );
      return formatDateTime(d);
    }

    function statusFor(id: string): DealStatus {
      const n = seededNumber(id + "_st", 1, 100);
      return n <= 88 ? "enabled" : "disabled";
    }

    function statsFor(id: string) {
      return {
        dealCount: seededNumber(id + "_deal", 0, 25),
        ticketCount: seededNumber(id + "_ticket", 0, 18),
      };
    }

    function fallbackIntro(name: string) {
      return [
        `${name} 提供舒適的環境與貼心服務，適合日常消費與聚會。`,
        "店內不定期推出限時活動與會員優惠，建議關注最新消息。",
      ];
    }

    function fallbackRules() {
      return [
        "請於消費前出示優惠券給店員確認",
        "每人每次限用一張優惠券",
        "本優惠不得與其他優惠併用",
        "特殊節日可能不適用",
        "詳細使用規範以現場公告為準",
      ];
    }

    function mapCategory(mainLabel: string, subLabel: string) {
      const mainId = mainLabelToId[mainLabel] || "food";
      const subId = subLabelToId[`${mainId}__${subLabel}`] || (categorySubMap[mainId]?.[0]?.id ?? "chain-restaurant");
      return { mainId, subId };
    }

    const featuredIds = new Set<string>(["s1", "s3", "s5", "s8", "s10"]);

    const items: AdminDeal[] = rawStores.map((s) => {
      const { mainId, subId } = mapCategory(s.categoryMain, s.categorySub);

      const isVm = s.id === "s5";
      const ratingNum = isVm ? vmDetail.rating : Number(s.rating) || 0;

      return {
        id: s.id,
        name: s.name,
        status: statusFor(s.id),
        isFeatured: featuredIds.has(s.id),

        categoryMainId: mainId,
        categorySubId: subId,

        rating: ratingNum,
        distanceText: isVm ? vmDetail.distance : s.distance,
        badge: s.badge,

        coverUrl: s.coverUrl,

        hoursText: isVm ? vmDetail.hours : "週一至週日 11:00-22:00",
        phone: isVm ? vmDetail.phone : "02-0000-0000",
        addressText: isVm ? vmDetail.address : "台北市（示意地址）",
        imageUrl: isVm ? vmDetail.imageUrl : s.coverUrl,

        introParagraphs: isVm ? vmDetail.introParagraphs : fallbackIntro(s.name),
        rules: isVm ? vmDetail.rules : fallbackRules(),

        stats: statsFor(s.id),
        updatedAt: updatedAtFor(s.id),
      };
    });

    return {
      items,

      categoryMain,
      categorySubMap,

      filters: {
        keyword: "",
        status: "",
        categoryMainId: "",
        categorySubId: "",
        featuredOnly: false,
      } as Filters,

      sort: {
        key: "updatedAt" as SortKey,
        dir: "desc" as SortDir,
      },

      page: 1,
      pageSize: 10,

      selectedIds: [] as string[],
    };
  },

  getters: {
    categoryMainLabelMap(state) {
      const map: Record<string, string> = {};
      for (const c of state.categoryMain) map[c.id] = c.label;
      return map;
    },

    categorySubLabelMap(state) {
      const map: Record<string, Record<string, string>> = {};
      for (const mainId of Object.keys(state.categorySubMap)) {
        map[mainId] = {};

        const subs = state.categorySubMap[mainId] ?? [];
        for (const c of subs) map[mainId][c.id] = c.label;
      }
      return map;
    },

    subOptions(state) {
      return (mainId: string) => {
        const mid = String(mainId || "");
        return state.categorySubMap[mid] || [];
      };
    },

    getById(state) {
      return (id: string) => {
        const target = String(id || "");
        return state.items.find((x) => x.id === target) || null;
      };
    },

    filteredItems(state): AdminDeal[] {
      const kw = String(state.filters.keyword || "").trim();
      const status = state.filters.status;
      const mainId = String(state.filters.categoryMainId || "").trim();
      const subId = String(state.filters.categorySubId || "").trim();
      const featuredOnly = !!state.filters.featuredOnly;

      let arr = state.items.slice();

      if (kw) {
        arr = arr.filter((x) => {
          return (
            includesCI(x.name, kw) ||
            includesCI(x.id, kw) ||
            includesCI(x.phone, kw) ||
            includesCI(x.addressText, kw)
          );
        });
      }

      if (status) {
        arr = arr.filter((x) => x.status === status);
      }

      if (mainId) {
        arr = arr.filter((x) => x.categoryMainId === mainId);
      }

      if (subId) {
        arr = arr.filter((x) => x.categorySubId === subId);
      }

      if (featuredOnly) {
        arr = arr.filter((x) => x.isFeatured);
      }

      const key = state.sort.key;
      const dir = state.sort.dir;

      if (key && dir) {
        const factor = dir === "asc" ? 1 : -1;

        arr.sort((a, b) => {
          let va: any = null;
          let vb: any = null;

          if (key === "name") {
            va = a.name;
            vb = b.name;
          } else if (key === "rating") {
            va = a.rating;
            vb = b.rating;
          } else if (key === "distance") {
            va = parseDistanceKm(a.distanceText);
            vb = parseDistanceKm(b.distanceText);
          } else if (key === "dealCount") {
            va = a.stats.dealCount;
            vb = b.stats.dealCount;
          } else if (key === "ticketCount") {
            va = a.stats.ticketCount;
            vb = b.stats.ticketCount;
          } else if (key === "status") {
            va = normalizeStatusOrder(a.status);
            vb = normalizeStatusOrder(b.status);
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

    total(): number {
      return this.filteredItems.length;
    },

    pageCount(state): number {
      const total = this.filteredItems.length;
      const size = Math.max(1, Number(state.pageSize) || 10);
      return Math.max(1, Math.ceil(total / size));
    },

    pageItems(state): AdminDeal[] {
      const p = Math.min(Math.max(1, Number(state.page) || 1), this.pageCount);
      const size = Math.max(1, Number(state.pageSize) || 10);
      const start = (p - 1) * size;
      const end = start + size;
      return this.filteredItems.slice(start, end);
    },

    isSelected(state) {
      return (id: string) => state.selectedIds.includes(id);
    },

    isAllSelectedOnPage(state): boolean {
      const ids = this.pageItems.map((x) => x.id);
      if (!ids.length) return false;
      return ids.every((id) => state.selectedIds.includes(id));
    },
  },

  actions: {
    setFilters(payload: Partial<Filters>) {
      this.filters = {
        ...this.filters,
        ...payload,
      };
    },

    applyFilters() {
      this.page = 1;
      const pc = this.pageCount;
      if (this.page > pc) this.page = pc;
    },

    resetFilters() {
      this.filters.keyword = "";
      this.filters.status = "";
      this.filters.categoryMainId = "";
      this.filters.categorySubId = "";
      this.filters.featuredOnly = false;
      this.page = 1;
    },

    setPage(p: number) {
      const next = Math.min(Math.max(1, Number(p) || 1), this.pageCount);
      this.page = next;
    },

    setPageSize(size: number) {
      const nextSize = Math.max(1, Number(size) || 10);
      this.pageSize = nextSize;
      this.page = 1;
    },

    toggleSort(key: string) {
      const k = String(key || "") as SortKey;

      const allowed: SortKey[] = [
        "name",
        "rating",
        "distance",
        "dealCount",
        "ticketCount",
        "status",
        "updatedAt",
        "",
      ];
      if (!allowed.includes(k)) return;

      if (this.sort.key !== k) {
        this.sort.key = k;
        this.sort.dir = "asc";
        this.page = 1;
        return;
      }

      if (this.sort.dir === "asc") {
        this.sort.dir = "desc";
        this.page = 1;
        return;
      }

      if (this.sort.dir === "desc") {
        this.sort.key = "updatedAt";
        this.sort.dir = "desc";
        this.page = 1;
        return;
      }

      this.sort.dir = "asc";
      this.page = 1;
    },

    toggleSelect(id: string) {
      const target = String(id || "");
      if (!target) return;

      const idx = this.selectedIds.indexOf(target);
      if (idx >= 0) this.selectedIds.splice(idx, 1);
      else this.selectedIds.push(target);
    },

    toggleSelectAllOnPage() {
      const ids = this.pageItems.map((x) => x.id);
      if (!ids.length) return;

      const allSelected = ids.every((id) => this.selectedIds.includes(id));

      if (allSelected) {
        this.selectedIds = this.selectedIds.filter((id) => !ids.includes(id));
      } else {
        const set = new Set(this.selectedIds);
        for (const id of ids) set.add(id);
        this.selectedIds = Array.from(set);
      }
    },

    clearSelection() {
      this.selectedIds = [];
    },

    upsertDeal(payload: Partial<AdminDeal> & { id: string }) {
      const id = String(payload.id || "");
      if (!id) return;

      const idx = this.items.findIndex((x) => x.id === id);

      if (idx >= 0) {
        const prev = this.items[idx];
        if (!prev) return;

        const next: AdminDeal = {
          ...prev,
          ...payload,
          stats: {
            ...prev.stats,
            ...(payload.stats ?? {}),
          },
          introParagraphs: Array.isArray(payload.introParagraphs)
            ? payload.introParagraphs
            : prev.introParagraphs,
          rules: Array.isArray(payload.rules) ? payload.rules : prev.rules,
        };

        this.items.splice(idx, 1, next);
        return;
      }

      const created: AdminDeal = {
        id,
        name: payload.name ?? "未命名店家",
        status: payload.status ?? "enabled",
        isFeatured: payload.isFeatured ?? false,

        categoryMainId: payload.categoryMainId ?? "",
        categorySubId: payload.categorySubId ?? "",

        rating: Number(payload.rating ?? 0),
        distanceText: payload.distanceText ?? "",
        badge: payload.badge ?? "",

        coverUrl: payload.coverUrl ?? "",

        hoursText: payload.hoursText ?? "",
        phone: payload.phone ?? "",
        addressText: payload.addressText ?? "",
        imageUrl: payload.imageUrl ?? payload.coverUrl ?? "",

        introParagraphs: Array.isArray(payload.introParagraphs) ? payload.introParagraphs : [],
        rules: Array.isArray(payload.rules) ? payload.rules : [],

        stats: {
          dealCount: payload.stats?.dealCount ?? 0,
          ticketCount: payload.stats?.ticketCount ?? 0,
        },

        updatedAt: payload.updatedAt ?? formatDateTime(new Date()),
      };

      this.items.unshift(created);
    },

    removeDeal(id: string) {
      const target = String(id || "");
      if (!target) return;

      this.items = this.items.filter((x) => x.id !== target);
      this.selectedIds = this.selectedIds.filter((x) => x !== target);

      const pc = this.pageCount;
      if (this.page > pc) this.page = pc;
    },
  },
});
