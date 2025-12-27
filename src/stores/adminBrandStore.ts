// src/stores/adminBrandStore.ts
import { defineStore } from "pinia";

type BrandStatus = "enabled" | "disabled";

export type AdminBrand = {
  id: string;
  name: string;
  logoUrl: string;
  coverUrl: string;

  // 後台用：一個品牌可能屬於多個分類
  categoryIds: string[];

  // 是否精選（首頁推薦/精選品牌）
  isFeatured: boolean;

  // 上架/下架
  status: BrandStatus;

  // 統計欄位（你列表上會顯示）
  stats: {
    storeCount: number;
    dealCount: number;
    ticketCount: number;
    subscriberCount: number;
    orderCount30d: number;
  };

  // 方便顯示的更新時間字串（先用靜態）
  updatedAt: string;
};

type Category = { id: string; label: string };

type Filters = {
  keyword: string; // 品牌名稱 / ID
  status: "" | BrandStatus;
  categoryId: string; // 單選：用於快速篩選
  featuredOnly: boolean; // 目前 UI 沒放這個欄位，但保留
};

type SortDir = "asc" | "desc" | "";
type SortKey =
  | "name"
  | "storeCount"
  | "dealCount"
  | "ticketCount"
  | "subscriberCount"
  | "orderCount30d"
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
  // 簡易 hash -> 穩定的假資料數字
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const r = h % 10000;
  const t = r / 9999;
  return Math.floor(min + t * (max - min));
}

function includesCI(a: string, b: string) {
  return String(a || "").toLowerCase().includes(String(b || "").toLowerCase());
}

function normalizeStatusOrder(s: BrandStatus) {
  // 排序用：enabled 先於 disabled
  return s === "enabled" ? 0 : 1;
}

export const useAdminBrandStore = defineStore("adminBrandStore", {
  state: () => {
    const categories: Category[] = [
      { id: "food", label: "美味餐廳" },
      { id: "daily", label: "生活雜貨" },
      { id: "hotel", label: "飯店旅館" },
      { id: "sport", label: "運動健身" },
      { id: "beauty", label: "美容保養" },
      { id: "coffee", label: "咖啡飲品" },
      { id: "appliance", label: "家電" },
      { id: "health", label: "保健醫療" },
      { id: "storage", label: "傢俱收納" },
      { id: "mobile", label: "手機相機" },
      { id: "paper", label: "日用紙品" },
      { id: "3c", label: "3C周邊" },
      { id: "pet", label: "寵物用品" },
      { id: "art", label: "圖藝" },
    ];

    // 你前台 brands 的縮影（後台只需要品牌層級）
    const rawBrands = [
      {
        id: "kfc",
        name: "肯德基",
        logoUrl:
          "https://images.unsplash.com/photo-1696522618649-403387cb93bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLRkMlMjBsb2dvfGVufDF8fHx8MTc2NTI1ODYwOXww&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "starbucks",
        name: "星巴克",
        logoUrl:
          "https://images.unsplash.com/photo-1545231027-637d2f6210f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTdGFyYnVja3MlMjBsb2dvfGVufDF8fHx8MTc2NTI1MzU3OHww&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "tkk",
        name: "真珠台灣家味",
        logoUrl: "https://i.pinimg.com/736x/ce/7d/a4/ce7da4eb27d85e6dba3d0ab5691f12ca.jpg",
      },
      {
        id: "gogocafe",
        name: "旬日咖啡",
        logoUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "bbq",
        name: "開飯川食堂",
        logoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "paradise",
        name: "饗食天堂",
        logoUrl: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "taco",
        name: "Taco Bell",
        logoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "dq",
        name: "DQ",
        logoUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "subway",
        name: "Subway",
        logoUrl:
          "https://images.unsplash.com/photo-1764344815160-0e2afc6939a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTdWJ3YXklMjByZXN0YXVyYW50JTIwbG9nb3xlbnwxfHx8fDE3NjUyNTg2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "burgerking",
        name: "漢堡王",
        logoUrl:
          "https://images.unsplash.com/photo-1654573821777-e00c3a414335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdXJnZXIlMjBLaW5nJTIwbG9nb3xlbnwxfHx8fDE3NjUyNTg2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "mcd",
        name: "麥當勞",
        logoUrl:
          "https://images.unsplash.com/photo-1699727277806-fc241c142c04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNY0RvbmFsZCUyN3MlMjBsb2dvfGVufDF8fHx8MTc2NTI1ODYxMHww&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "pizza",
        name: "必勝客",
        logoUrl:
          "https://images.unsplash.com/photo-1620174645265-05820da4ff20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaXp6YSUyMEh1dCUyMGxvZ298ZW58MXx8fHwxNzY1MjUzNTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "mos",
        name: "溫蒂漢堡",
        logoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "pollo",
        name: "波登萊炸",
        logoUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "ikea",
        name: "IKEA",
        logoUrl: "https://images.unsplash.com/photo-1679050367261-d7a4a7747ef4?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "pxmart",
        name: "全聯",
        logoUrl: "https://images.unsplash.com/photo-1671427478482-2968e71a6311?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "carrefour",
        name: "家樂福",
        logoUrl: "https://images.unsplash.com/photo-1757940059931-6e3c6572d989?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "eslite",
        name: "誠品書店",
        logoUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "cosmed",
        name: "康是美",
        logoUrl: "https://images.unsplash.com/photo-1761036602705-48c4b69232c8?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "watsons",
        name: "屈臣氏",
        logoUrl: "https://images.unsplash.com/photo-1713937187927-4e80f5a54efa?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "poya",
        name: "寶雅",
        logoUrl: "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "net",
        name: "NET",
        logoUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "uniqlo",
        name: "UNIQLO",
        logoUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop&q=90",
      },
      {
        id: "muji",
        name: "MUJI無印良品",
        logoUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=800&fit=crop&q=90",
      },
    ];

    const featuredBrandIds = [
      "starbucks",
      "ikea",
      "pxmart",
      "carrefour",
      "eslite",
      "cosmed",
      "watsons",
      "poya",
      "net",
      "uniqlo",
    ];

    // 給每個品牌分配 1~3 個分類（假資料用）
    const categoryPool = categories.map((c) => c.id);
    function pickCategoriesForBrand(id: string) {
      const count = seededNumber(id, 1, 3);

      if (categoryPool.length === 0) return [];

      const start = seededNumber(id + "_c", 0, categoryPool.length - 1);
      const picked: string[] = [];

      for (let i = 0; i < count; i++) {
        const idx = (start + i * 3) % categoryPool.length;
        const cid = categoryPool[idx];

        if (typeof cid === "string") {
          picked.push(cid);
        }
      }

      return Array.from(new Set(picked));
    }

    // 更新時間：用 id 生成一個「最近 N 天」的固定時間
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

    // 統計：用 seed 產生穩定數字
    function statsFor(id: string) {
      const storeCount = seededNumber(id + "_s", 0, 12);
      const dealCount = seededNumber(id + "_d", 0, 25);
      const ticketCount = seededNumber(id + "_t", 0, 18);
      const subscriberCount = seededNumber(id + "_sub", 50, 30000);
      const orderCount30d = seededNumber(id + "_o30", 0, 20000);
      return { storeCount, dealCount, ticketCount, subscriberCount, orderCount30d };
    }

    // 狀態：大部分上架，少數下架
    function statusFor(id: string): BrandStatus {
      const n = seededNumber(id + "_st", 1, 100);
      return n <= 85 ? "enabled" : "disabled";
    }

    const items: AdminBrand[] = rawBrands.map((b) => {
      return {
        id: b.id,
        name: b.name,
        logoUrl: b.logoUrl,
        coverUrl: "",
        categoryIds: pickCategoriesForBrand(b.id),
        isFeatured: featuredBrandIds.includes(b.id),
        status: statusFor(b.id),
        stats: statsFor(b.id),
        updatedAt: updatedAtFor(b.id),
      };
    });

    return {
      // data
      items,
      categories,

      // filters
      filters: {
        keyword: "",
        status: "",
        categoryId: "",
        featuredOnly: false,
      } as Filters,

      // sort（預設：依更新時間 desc）
      sort: {
        key: "updatedAt" as SortKey,
        dir: "desc" as SortDir,
      },

      // pagination
      page: 1,
      pageSize: 10,

      // selection
      selectedIds: [] as string[],
    };
  },

  getters: {
    categoryLabelMap(state) {
      const map: Record<string, string> = {};
      for (const c of state.categories) map[c.id] = c.label;
      return map;
    },

    // 先依 filters + sort 算出完整清單（這裡不用存 total，getter 直接算）
    filteredItems(state): AdminBrand[] {
      const kw = String(state.filters.keyword || "").trim();
      const status = state.filters.status;
      const categoryId = String(state.filters.categoryId || "").trim();
      const featuredOnly = !!state.filters.featuredOnly;

      let arr = state.items.slice();

      if (kw) {
        arr = arr.filter((x) => includesCI(x.name, kw) || includesCI(x.id, kw));
      }

      if (status) {
        arr = arr.filter((x) => x.status === status);
      }

      if (categoryId) {
        arr = arr.filter((x) => (x.categoryIds || []).includes(categoryId));
      }

      if (featuredOnly) {
        arr = arr.filter((x) => x.isFeatured);
      }

      // sort
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
          } else if (key === "storeCount") {
            va = a.stats.storeCount;
            vb = b.stats.storeCount;
          } else if (key === "dealCount") {
            va = a.stats.dealCount;
            vb = b.stats.dealCount;
          } else if (key === "ticketCount") {
            va = a.stats.ticketCount;
            vb = b.stats.ticketCount;
          } else if (key === "subscriberCount") {
            va = a.stats.subscriberCount;
            vb = b.stats.subscriberCount;
          } else if (key === "orderCount30d") {
            va = a.stats.orderCount30d;
            vb = b.stats.orderCount30d;
          } else if (key === "status") {
            va = normalizeStatusOrder(a.status);
            vb = normalizeStatusOrder(b.status);
          } else if (key === "updatedAt") {
            // yyyy-mm-dd HH:mm 可直接字串比（同格式）
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

    total(state): number {
      return this.filteredItems.length;
    },

    pageCount(state): number {
      const total = this.filteredItems.length;
      const size = Math.max(1, Number(state.pageSize) || 10);
      return Math.max(1, Math.ceil(total / size));
    },

    pageItems(state): AdminBrand[] {
      const p = Math.min(Math.max(1, Number(state.page) || 1), this.pageCount);
      const size = Math.max(1, Number(state.pageSize) || 10);
      const start = (p - 1) * size;
      const end = start + size;
      return this.filteredItems.slice(start, end);
    },

    // 勾選狀態
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
    // 篩選
    setFilters(payload: Partial<Filters>) {
      this.filters = {
        ...this.filters,
        ...payload,
      };
    },

    applyFilters() {
      // 套用篩選後，回到第 1 頁
      this.page = 1;

      // 若目前頁數大於 pageCount，也要修正（保險）
      const pc = this.pageCount;
      if (this.page > pc) this.page = pc;
    },

    resetFilters() {
      this.filters.keyword = "";
      this.filters.status = "";
      this.filters.categoryId = "";
      this.filters.featuredOnly = false;
      this.page = 1;
    },

    // 分頁
    setPage(p: number) {
      const next = Math.min(Math.max(1, Number(p) || 1), this.pageCount);
      this.page = next;
    },

    setPageSize(size: number) {
      const nextSize = Math.max(1, Number(size) || 10);
      this.pageSize = nextSize;
      this.page = 1;
    },

    // 排序：點一次 -> asc，第二次 -> desc，第三次 -> 清除（回預設：updatedAt desc）
    toggleSort(key: string) {
      const k = String(key || "") as SortKey;

      // 不允許未知 key，避免錯誤
      const allowed: SortKey[] = [
        "name",
        "storeCount",
        "dealCount",
        "ticketCount",
        "subscriberCount",
        "orderCount30d",
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
        // 清除排序：回到預設更新時間 desc
        this.sort.key = "updatedAt";
        this.sort.dir = "desc";
        this.page = 1;
        return;
      }

      // 兜底
      this.sort.dir = "asc";
      this.page = 1;
    },

    // 勾選
    toggleSelect(id: string) {
      const target = String(id || "");
      if (!target) return;

      const idx = this.selectedIds.indexOf(target);
      if (idx >= 0) {
        this.selectedIds.splice(idx, 1);
      } else {
        this.selectedIds.push(target);
      }
    },

    toggleSelectAllOnPage() {
      const ids = this.pageItems.map((x) => x.id);

      if (!ids.length) return;

      const allSelected = ids.every((id) => this.selectedIds.includes(id));

      if (allSelected) {
        // 取消本頁
        this.selectedIds = this.selectedIds.filter((id) => !ids.includes(id));
      } else {
        // 勾選本頁
        const set = new Set(this.selectedIds);
        for (const id of ids) set.add(id);
        this.selectedIds = Array.from(set);
      }
    },

    clearSelection() {
      this.selectedIds = [];
    },

    // 之後你接 API 可以把這個換成 fetch
    upsertBrand(payload: Partial<AdminBrand> & { id: string }) {
      const id = String(payload.id || "");
      if (!id) return;

      const idx = this.items.findIndex((x) => x.id === id);

      if (idx >= 0) {
        const prev = this.items[idx];

        // ✅ TS 需要這句：確保 prev 一定存在
        if (!prev) return;

        const mergedStats = {
          ...prev.stats,
          ...(payload.stats ?? {}),
        };

        const next: AdminBrand = {
          ...prev,
          ...payload,
          coverUrl: payload.coverUrl ?? prev.coverUrl ?? "",
          stats: mergedStats,
          categoryIds: Array.isArray(payload.categoryIds) ? payload.categoryIds : prev.categoryIds,
        };

        this.items.splice(idx, 1, next);
        return;
      }

      // ✅ 新增時：補齊必填欄位（避免 next 缺欄位造成型別不合）
      const created: AdminBrand = {
        id,
        name: payload.name ?? "未命名品牌",
        logoUrl: payload.logoUrl ?? "",
        coverUrl: payload.coverUrl ?? "",
        status: payload.status ?? "enabled",
        isFeatured: payload.isFeatured ?? false,
        categoryIds: Array.isArray(payload.categoryIds) ? payload.categoryIds : [],
        updatedAt: payload.updatedAt ?? new Date().toISOString().slice(0, 10),
        stats: {
          storeCount: payload.stats?.storeCount ?? 0,
          dealCount: payload.stats?.dealCount ?? 0,
          ticketCount: payload.stats?.ticketCount ?? 0,
          subscriberCount: payload.stats?.subscriberCount ?? 0,
          orderCount30d: payload.stats?.orderCount30d ?? 0,
        },
      };

      this.items.unshift(created);
    },

    removeBrand(id: string) {
      const target = String(id || "");
      if (!target) return;
      this.items = this.items.filter((x) => x.id !== target);
      this.selectedIds = this.selectedIds.filter((x) => x !== target);

      const pc = this.pageCount;
      if (this.page > pc) this.page = pc;
    },
  },
});
