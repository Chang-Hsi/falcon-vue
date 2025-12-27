// src/stores/adminSearchStore.ts
import { defineStore } from "pinia";

export type ItemStatus = "enabled" | "disabled";

export type SortField = "weight" | "rating" | "distanceKm" | "name";
export type SortDir = "asc" | "desc";

export type SearchMatchMode = "contains" | "startsWith" | "exact";
export type EmptyKeywordBehavior = "all" | "hot" | "none";

export type SearchFields = {
  brand: boolean;
  name: boolean;
  categoryMain: boolean;
  categorySub: boolean;
  badge: boolean;
};

export type SearchRules = {
  exactGroupFirst: boolean;
  matchMode: SearchMatchMode;
  emptyKeywordBehavior: EmptyKeywordBehavior;
  resultLimit: number;
  fields: SearchFields;
  normalize: {
    trim: boolean;
    lowerCase: boolean;
    removeSpaces: boolean;
  };
};

export type SortStrategy = {
  field: SortField;
  dir: SortDir;
};

export type HotKeyword = {
  id: string;
  text: string;
  status: ItemStatus;
  order: number;
  aliases: string[];
  updatedAt: string;
};

export type KeywordGroup = {
  id: string;
  title: string;
  status: ItemStatus;
  order: number;
  aliases: string[];
  coverUrl?: string;
  weight: number;
  updatedAt: string;
};

export type AdminStore = {
  id: string;
  groupId: string;
  brand: string;
  name: string;
  categoryMain: string;
  categorySub: string;
  rating: number;
  distanceKm: number;
  badge: string;
  coverUrl: string;
  status: ItemStatus;
  weight: number;
  updatedAt: string;
};

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "enable"
  | "disable"
  | "reorder"
  | "import"
  | "export"
  | "rule-change";

export type AuditLog = {
  id: string;
  at: string;
  actor: string;
  action: AuditAction;
  entityType: "hotKeyword" | "group" | "store" | "rule";
  entityId?: string;
  summary: string;
  payload?: Record<string, unknown>;
};

export type FrontStoreCard = {
  id: string;
  brand: string;
  name: string;
  categoryMain: string;
  categorySub: string;
  rating: string;
  distance: string;
  badge: string;
  coverUrl: string;
};

export type FrontSearchPayload = {
  hotKeywords: string[];
  storesByKeyword: Record<string, FrontStoreCard[]>;
};

/* ✅ CHART: 趨勢統計資料結構（給 ECharts 用） */
export type TrendRangeDays = 7 | 30 | 90;
export type TrendBucketKey = "0" | "1-3" | "4-10" | "11-50" | "51+";

export type SearchDailyMetric = {
  date: string; // YYYY-MM-DD
  searches: number;
  zeroResults: number;
  avgResults: number;
  buckets: Record<TrendBucketKey, number>;
  topKeywords: Record<string, number>; // keyword -> count
};

export type SearchAnalytics = {
  daily: SearchDailyMetric[];
  updatedAt: string;
};

type AdminSearchState = {
  hotKeywords: HotKeyword[];
  groups: KeywordGroup[];
  stores: AdminStore[];
  rules: SearchRules;
  sort: SortStrategy;
  logs: AuditLog[];

  /* ✅ CHART: 趨勢資料放在 store 內，後台元件直接用 */
  analytics: SearchAnalytics;
};

function nowISO(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function toSafeText(v: unknown): string {
  return String(v ?? "");
}

function normalizeText(v: unknown, rules: SearchRules): string {
  let s = toSafeText(v);

  if (rules.normalize.trim) s = s.trim();
  if (rules.normalize.lowerCase) s = s.toLowerCase();
  if (rules.normalize.removeSpaces) s = s.replace(/\s+/g, "");

  return s;
}

function matchKeyword(hay: string, needle: string, mode: SearchMatchMode): boolean {
  if (!needle) return true;
  if (mode === "exact") return hay === needle;
  if (mode === "startsWith") return hay.startsWith(needle);
  return hay.includes(needle);
}

function kmToDisplay(km: number): string {
  if (!Number.isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/* ✅ CHART: 日期工具 */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

/* ✅ CHART: 固定種子亂數（讓假資料每次刷新比較穩定） */
function makeSeededRng(seed = 20251227) {
  let s = seed >>> 0;
  return () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return (s % 10000) / 10000;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/* ✅ CHART: 生成趨勢靜態資料（90 天） */
function makeMockAnalyticsDaily(params: {
  days: number;
  keywordPool: string[];
  seed?: number;
}): SearchDailyMetric[] {
  const { days, keywordPool } = params;
  const rng = makeSeededRng(params.seed ?? 20251227);

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));

  const out: SearchDailyMetric[] = [];

  // 做一個「緩慢上升 + 週期波動」的趨勢，並混一些隨機
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const weekday = d.getDay(); // 0 Sun
    const weeklyBoost = weekday === 0 || weekday === 6 ? 0.85 : 1.0; // 假設週末搜尋略少
    const growth = 0.85 + i * 0.003; // 緩慢上升
    const noise = 0.85 + rng() * 0.4;

    const baseSearch = Math.round(220 * growth * weeklyBoost * noise); // 每日搜尋量
    const searches = Math.max(20, baseSearch);

    // 0 結果率大約 5%~18%
    const zeroRate = clamp(0.05 + rng() * 0.13, 0.03, 0.25);
    const zeroResults = Math.round(searches * zeroRate);

    // 平均回傳筆數 6~28
    const avgResults = Math.round(clamp(8 + rng() * 20, 1, 60));

    // buckets：大概比例分配（總和 = searches）
    // 0 bucket = zeroResults，其他依比例分配
    const rest = Math.max(0, searches - zeroResults);
    const r1 = 0.28 + rng() * 0.12; // 1-3
    const r2 = 0.34 + rng() * 0.12; // 4-10
    const r3 = 0.25 + rng() * 0.10; // 11-50
    let b1 = Math.round(rest * r1);
    let b2 = Math.round(rest * r2);
    let b3 = Math.round(rest * r3);
    let b4 = rest - b1 - b2 - b3;
    if (b4 < 0) b4 = 0;

    const buckets: Record<TrendBucketKey, number> = {
      "0": zeroResults,
      "1-3": b1,
      "4-10": b2,
      "11-50": b3,
      "51+": b4,
    };

    // topKeywords：挑 5~8 個關鍵字分配 counts（總和 <= searches）
    const topCount = 5 + Math.floor(rng() * 4);
    const picks: string[] = [];
    const pool = [...keywordPool];

    for (let k = 0; k < topCount && pool.length; k++) {
      const idx = Math.floor(rng() * pool.length);

      // ✅ 用 splice 直接「取出」元素：回傳型別是 string[]
      const picked = pool.splice(idx, 1)[0];

      // ✅ picked 仍可能是 undefined（理論上不會，但 TS 會要求你處理）
      if (picked) picks.push(picked);
    }

    // 分配：top keyword 合計大約 35%~65% 搜尋量
    const topTotal = Math.round(searches * clamp(0.35 + rng() * 0.3, 0.2, 0.8));
    let left = topTotal;

    const topKeywords: Record<string, number> = {};

    // ✅ 用 entries()：kw 會是 string，不會是 string | undefined
    for (const [k, kw] of picks.entries()) {
      const remainSlots = picks.length - k;

      const part =
        k === picks.length - 1
          ? left
          : Math.max(1, Math.round((left / remainSlots) * (0.7 + rng() * 0.6)));

      topKeywords[kw] = part;

      left -= part;
      if (left <= 0) break;
    }

    out.push({
      date: formatYMD(d),
      searches,
      zeroResults,
      avgResults,
      buckets,
      topKeywords,
    });
  }

  return out;
}

// ✅ LOGS: 生成 1~12 月「操作紀錄」靜態假資料
function makeMockLogsForMonths(params: {
  year: number;
  hotKeywords: HotKeyword[];
  groups: KeywordGroup[];
  stores: AdminStore[];
  seed?: number;
}): AuditLog[] {
  const { year, hotKeywords, groups, stores } = params;
  const rng = makeSeededRng((params.seed ?? 20251227) + year);

  function pick<T>(arr: T[]): T {
    if (!arr.length) return arr[0] as T;

    const idx = Math.floor(rng() * arr.length);
    const v = arr[idx];

    // ✅ 最小改動：加上 as T，讓 TS 不再把它當成 T | undefined
    return (v === undefined ? arr[0] : v) as T;
  }
  
  function makeAt(month: number, day: number, hour = 12, minute = 0): string {
    // ✅ 用「中午」避免時區造成跨日/月
    return new Date(year, month - 1, day, hour, minute, 0).toISOString();
  }

  const actors = ["admin", "營運A", "編輯者B", "PM"] as const;

  const actionPool: AuditAction[] = [
    "create",
    "update",
    "delete",
    "enable",
    "disable",
    "reorder",
    "import",
    "export",
    "rule-change",
  ];

  const logs: AuditLog[] = [];

  for (let m = 1; m <= 12; m++) {
    const count = 10 + Math.floor(rng() * 8); // 每月 10~17 筆

    for (let i = 1; i <= count; i++) {
      const action = pick(actionPool);

      // ✅ 讓 entityType 跟 action 更合理
      let entityType: AuditLog["entityType"] = "store";
      if (action === "rule-change") entityType = "rule";
      else if (action === "reorder") entityType = "group";
      else if (action === "import" || action === "export") entityType = "store";
      else if (action === "enable" || action === "disable") entityType = pick(["hotKeyword", "group", "store"]);

      const actor = pick([...actors]);

      const day = 1 + Math.floor(rng() * 27);
      const hour = 9 + Math.floor(rng() * 9);
      const minute = Math.floor(rng() * 60);

      let entityId: string | undefined;
      let summary = "";
      let payload: Record<string, unknown> | undefined;

      if (entityType === "store") {
        const s = stores.length ? pick(stores) : null;
        entityId = s?.id;
        if (action === "create") summary = `新增店家：${s?.name ?? "（未命名）"}`;
        else if (action === "delete") summary = `刪除店家：${s?.name ?? "（未命名）"}`;
        else if (action === "enable") summary = `啟用店家：${s?.name ?? "（未命名）"}`;
        else if (action === "disable") summary = `停用店家：${s?.name ?? "（未命名）"}`;
        else if (action === "import") summary = `匯入店家資料（${m}月批次）`;
        else if (action === "export") summary = `匯出店家資料（${m}月報表）`;
        else summary = `更新店家：${s?.name ?? "（未命名）"}`;

        payload = {
          month: m,
          target: s?.id ?? "",
          note: action === "import" ? "批次匯入" : action === "export" ? "下載報表" : "一般更新",
        };
      }

      if (entityType === "group") {
        const g = groups.length ? pick(groups) : null;
        entityId = g?.id;
        if (action === "reorder") summary = `調整群組排序：${g?.title ?? "（未命名）"}`;
        else if (action === "create") summary = `新增群組：${g?.title ?? "（未命名）"}`;
        else if (action === "delete") summary = `刪除群組：${g?.title ?? "（未命名）"}`;
        else if (action === "enable") summary = `啟用群組：${g?.title ?? "（未命名）"}`;
        else if (action === "disable") summary = `停用群組：${g?.title ?? "（未命名）"}`;
        else summary = `更新群組：${g?.title ?? "（未命名）"}`;

        payload = { month: m, groupId: g?.id ?? "", action };
      }

      if (entityType === "hotKeyword") {
        const hk = hotKeywords.length ? pick(hotKeywords) : null;
        entityId = hk?.id;
        if (action === "create") summary = `新增熱門字：${hk?.text ?? "（未命名）"}`;
        else if (action === "delete") summary = `刪除熱門字：${hk?.text ?? "（未命名）"}`;
        else if (action === "enable") summary = `啟用熱門字：${hk?.text ?? "（未命名）"}`;
        else if (action === "disable") summary = `停用熱門字：${hk?.text ?? "（未命名）"}`;
        else summary = `更新熱門字：${hk?.text ?? "（未命名）"}`;

        payload = { month: m, hotKeywordId: hk?.id ?? "", action };
      }

      if (entityType === "rule") {
        // ✅ 規則調整事件，讓圖形/列表更像真的
        summary = "更新搜尋規則";
        payload = {
          month: m,
          exactGroupFirst: rng() > 0.5,
          matchMode: pick(["contains", "startsWith", "exact"]),
          emptyKeywordBehavior: pick(["all", "hot", "none"]),
          resultLimit: 100 + Math.floor(rng() * 200),
        };
      }

      logs.push({
        id: `log_${year}_${pad2(m)}_${pad2(i)}`,
        at: makeAt(m, day, hour, minute),
        actor,
        action,
        entityType,
        entityId,
        summary,
        payload,
      });
    }
  }

  // ✅ 讓列表預設「最新在上」
  logs.sort((a, b) => (a.at < b.at ? 1 : -1));
  return logs;
}


export const useAdminSearchStore = defineStore("adminSearchStore", {
  state: (): AdminSearchState => {
    const hotKeywords: HotKeyword[] = [
      {
        id: "hk_starbucks",
        text: "星巴克",
        status: "enabled",
        order: 1,
        aliases: ["starbucks", "Starbucks", "星巴客"],
        updatedAt: nowISO(),
      },
      {
        id: "hk_ikea",
        text: "IKEA",
        status: "enabled",
        order: 2,
        aliases: ["宜家", "宜家家居", "ikea"],
        updatedAt: nowISO(),
      },
      {
        id: "hk_pxmart",
        text: "全聯",
        status: "enabled",
        order: 3,
        aliases: ["pxmart", "PXMART", "全聯福利中心"],
        updatedAt: nowISO(),
      },
      {
        id: "hk_carrefour",
        text: "家樂福",
        status: "enabled",
        order: 4,
        aliases: ["carrefour", "CARREFOUR"],
        updatedAt: nowISO(),
      },
      {
        id: "hk_eslite",
        text: "誠品書店",
        status: "enabled",
        order: 5,
        aliases: ["eslite", "誠品"],
        updatedAt: nowISO(),
      },
      {
        id: "hk_cosmed",
        text: "康是美",
        status: "enabled",
        order: 6,
        aliases: ["cosmed", "COSMED"],
        updatedAt: nowISO(),
      },
      {
        id: "hk_watsons",
        text: "屈臣氏",
        status: "enabled",
        order: 7,
        aliases: ["watsons", "WATSONS"],
        updatedAt: nowISO(),
      },
      {
        id: "hk_poya",
        text: "寶雅",
        status: "enabled",
        order: 8,
        aliases: ["poya", "POYA"],
        updatedAt: nowISO(),
      },
    ];

    const groups: KeywordGroup[] = [
      {
        id: "g_eslite",
        title: "誠品書店",
        status: "enabled",
        order: 1,
        aliases: ["eslite", "誠品"],
        weight: 90,
        updatedAt: nowISO(),
      },
      {
        id: "g_ikea",
        title: "IKEA",
        status: "enabled",
        order: 2,
        aliases: ["ikea", "宜家", "宜家家居"],
        weight: 85,
        updatedAt: nowISO(),
      },
      {
        id: "g_starbucks",
        title: "星巴克",
        status: "enabled",
        order: 3,
        aliases: ["starbucks", "星巴客"],
        weight: 88,
        updatedAt: nowISO(),
      },
      {
        id: "g_pxmart",
        title: "全聯",
        status: "enabled",
        order: 4,
        aliases: ["pxmart", "全聯福利中心"],
        weight: 80,
        updatedAt: nowISO(),
      },
      {
        id: "g_carrefour",
        title: "家樂福",
        status: "enabled",
        order: 5,
        aliases: ["carrefour"],
        weight: 78,
        updatedAt: nowISO(),
      },
      {
        id: "g_cosmed",
        title: "康是美",
        status: "enabled",
        order: 6,
        aliases: ["cosmed"],
        weight: 76,
        updatedAt: nowISO(),
      },
      {
        id: "g_watsons",
        title: "屈臣氏",
        status: "enabled",
        order: 7,
        aliases: ["watsons"],
        weight: 75,
        updatedAt: nowISO(),
      },
      {
        id: "g_poya",
        title: "寶雅",
        status: "enabled",
        order: 8,
        aliases: ["poya"],
        weight: 74,
        updatedAt: nowISO(),
      },
    ];

    const stores: AdminStore[] = [
      {
        id: "eslite-xinyi",
        groupId: "g_eslite",
        brand: "誠品書店",
        name: "誠品書店 信義旗艦店",
        categoryMain: "書籍文具",
        categorySub: "連鎖書店",
        rating: 4.7,
        distanceKm: 1.5,
        badge: "",
        coverUrl:
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=200&fit=crop",
        status: "enabled",
        weight: 50,
        updatedAt: nowISO(),
      },
      {
        id: "starbucks-dunhua",
        groupId: "g_starbucks",
        brand: "星巴克",
        name: "星巴克 敦南門市",
        categoryMain: "咖啡飲品",
        categorySub: "連鎖咖啡",
        rating: 4.7,
        distanceKm: 0.6,
        badge: "",
        coverUrl:
          "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=300&h=200&fit=crop",
        status: "enabled",
        weight: 55,
        updatedAt: nowISO(),
      },
      {
        id: "ikea-main",
        groupId: "g_ikea",
        brand: "IKEA",
        name: "IKEA",
        categoryMain: "家居",
        categorySub: "傢俱",
        rating: 4.6,
        distanceKm: 4.2,
        badge: "",
        coverUrl:
          "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=300&h=200&fit=crop",
        status: "enabled",
        weight: 52,
        updatedAt: nowISO(),
      },
      {
        id: "carrefour-xinzhuang",
        groupId: "g_carrefour",
        brand: "家樂福",
        name: "家樂福 新莊店",
        categoryMain: "量販賣場",
        categorySub: "大型超市",
        rating: 4.4,
        distanceKm: 4.0,
        badge: "停車方便",
        coverUrl:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=900&fit=crop&q=90",
        status: "enabled",
        weight: 49,
        updatedAt: nowISO(),
      },
    ];

    const rules: SearchRules = {
      exactGroupFirst: true,
      matchMode: "contains",
      emptyKeywordBehavior: "all",
      resultLimit: 200,
      fields: {
        brand: true,
        name: true,
        categoryMain: true,
        categorySub: true,
        badge: false,
      },
      normalize: {
        trim: true,
        lowerCase: true,
        removeSpaces: false,
      },
    };

    const sort: SortStrategy = {
      field: "weight",
      dir: "desc",
    };

    /* ✅ CHART: keywordPool（你也可以擴充更多字，圖會更好看） */
    const keywordPool = [
      ...hotKeywords.map((x) => x.text),
      "書店",
      "咖啡",
      "量販",
      "超市",
      "文具",
      "藥妝",
      "生活百貨",
      "家具",
      "停車",
      "親子",
      "不限品牌",
      "附近",
      "連鎖",
    ];

    const analyticsDaily = makeMockAnalyticsDaily({
      days: 90,
      keywordPool,
      seed: 20251227,
    });

    return {
      hotKeywords,
      groups,
      stores,
      rules,
      sort,

      // ✅ 這裡改成：載入 1~12 月操作紀錄假資料
      logs: makeMockLogsForMonths({
        year: new Date().getFullYear(),
        hotKeywords,
        groups,
        stores,
        seed: 20251227,
      }),

      analytics: {
        daily: analyticsDaily,
        updatedAt: nowISO(),
      },
    };
  },

  getters: {
    enabledHotKeywords(state): HotKeyword[] {
      return [...state.hotKeywords]
        .filter((x) => x.status === "enabled")
        .sort((a, b) => a.order - b.order);
    },

    enabledGroups(state): KeywordGroup[] {
      return [...state.groups]
        .filter((g) => g.status === "enabled")
        .sort((a, b) => a.order - b.order);
    },

    enabledStores(state): AdminStore[] {
      return state.stores.filter((s) => s.status === "enabled");
    },

    groupMap(state): Record<string, KeywordGroup> {
      const m: Record<string, KeywordGroup> = {};
      for (const g of state.groups) m[g.id] = g;
      return m;
    },

    /* ✅ CHART: 直接給 ECharts 用的通用資料（最後 N 天） */
    trendDailySlice:
      (state) =>
      (rangeDays: TrendRangeDays): SearchDailyMetric[] => {
        const list = state.analytics.daily;
        if (!list.length) return [];
        const n = Math.max(1, Number(rangeDays) || 7);
        return list.slice(Math.max(0, list.length - n));
      },

    /* ✅ CHART: 搜尋量折線（x: date, y: searches） */
    trendSearchVolume:
      (state) =>
      (rangeDays: TrendRangeDays) => {
        const list = state.analytics.daily;
        const n = Math.max(1, Number(rangeDays) || 7);
        const rows = list.slice(Math.max(0, list.length - n));
        const labels = rows.map((x) => x.date);
        const values = rows.map((x) => x.searches);
        return { labels, values };
      },

    /* ✅ CHART: 0 結果率折線（0~1） */
    trendZeroResultRate:
      (state) =>
      (rangeDays: TrendRangeDays) => {
        const list = state.analytics.daily;
        const n = Math.max(1, Number(rangeDays) || 7);
        const rows = list.slice(Math.max(0, list.length - n));
        const labels = rows.map((x) => x.date);
        const values = rows.map((x) => {
          if (!x.searches) return 0;
          return Number((x.zeroResults / x.searches).toFixed(4));
        });
        return { labels, values };
      },

    /* ✅ CHART: 平均回傳筆數折線 */
    trendAvgResults:
      (state) =>
      (rangeDays: TrendRangeDays) => {
        const list = state.analytics.daily;
        const n = Math.max(1, Number(rangeDays) || 7);
        const rows = list.slice(Math.max(0, list.length - n));
        const labels = rows.map((x) => x.date);
        const values = rows.map((x) => x.avgResults);
        return { labels, values };
      },

    /* ✅ CHART: 回傳筆數分佈（堆疊柱狀圖） */
    trendBuckets:
      (state) =>
      (rangeDays: TrendRangeDays) => {
        const list = state.analytics.daily;
        const n = Math.max(1, Number(rangeDays) || 7);
        const rows = list.slice(Math.max(0, list.length - n));
        const labels = rows.map((x) => x.date);

        const keys: TrendBucketKey[] = ["0", "1-3", "4-10", "11-50", "51+"];

        const series = keys.map((k) => ({
          name: k,
          data: rows.map((x) => x.buckets[k] ?? 0),
        }));

        return { labels, series };
      },

    /* ✅ CHART: Top Keyword 趨勢（多折線/多序列） */
    trendTopKeywords:
      (state) =>
      (rangeDays: TrendRangeDays, topN = 5) => {
        const list = state.analytics.daily;
        const n = Math.max(1, Number(rangeDays) || 7);
        const rows = list.slice(Math.max(0, list.length - n));
        const labels = rows.map((x) => x.date);

        const totalMap: Record<string, number> = {};
        for (const r of rows) {
          for (const [k, v] of Object.entries(r.topKeywords || {})) {
            totalMap[k] = (totalMap[k] || 0) + (Number(v) || 0);
          }
        }

        const topKeys = Object.entries(totalMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, Math.max(1, Number(topN) || 5))
          .map((x) => x[0]);

        const series = topKeys.map((kw) => ({
          name: kw,
          data: rows.map((r) => r.topKeywords?.[kw] ?? 0),
        }));

        return { labels, series };
      },
  },


  actions: {
    addLog(log: Omit<AuditLog, "id" | "at">) {
      this.logs.unshift({
        id: uid("log"),
        at: nowISO(),
        ...log,
      });
      if (this.logs.length > 300) this.logs.pop();
    },

    setRules(patch: Partial<SearchRules>, actor = "admin") {
      this.rules = {
        ...this.rules,
        ...patch,
        fields: patch.fields ? { ...this.rules.fields, ...patch.fields } : this.rules.fields,
        normalize: patch.normalize
          ? { ...this.rules.normalize, ...patch.normalize }
          : this.rules.normalize,
      };

      this.addLog({
        actor,
        action: "rule-change",
        entityType: "rule",
        summary: "更新搜尋規則",
        payload: patch as unknown as Record<string, unknown>,
      });
    },

    setSort(sort: Partial<SortStrategy>, actor = "admin") {
      this.sort = { ...this.sort, ...sort };

      this.addLog({
        actor,
        action: "update",
        entityType: "rule",
        summary: "更新排序策略",
        payload: sort as unknown as Record<string, unknown>,
      });
    },

    upsertGroup(input: Omit<KeywordGroup, "updatedAt">, actor = "admin") {
      const idx = this.groups.findIndex((g) => g.id === input.id);
      const next: KeywordGroup = { ...input, updatedAt: nowISO() };

      if (idx >= 0) {
        this.groups[idx] = next;
        this.addLog({
          actor,
          action: "update",
          entityType: "group",
          entityId: input.id,
          summary: `更新群組：${input.title}`,
        });
      } else {
        this.groups.push(next);
        this.addLog({
          actor,
          action: "create",
          entityType: "group",
          entityId: input.id,
          summary: `新增群組：${input.title}`,
        });
      }
    },

    upsertHotKeyword(input: Omit<HotKeyword, "updatedAt">, actor = "admin") {
      const idx = this.hotKeywords.findIndex((k) => k.id === input.id);
      const next: HotKeyword = { ...input, updatedAt: nowISO() };

      if (idx >= 0) {
        this.hotKeywords[idx] = next;
        this.addLog({
          actor,
          action: "update",
          entityType: "hotKeyword",
          entityId: input.id,
          summary: `更新熱門字：${input.text}`,
        });
      } else {
        this.hotKeywords.push(next);
        this.addLog({
          actor,
          action: "create",
          entityType: "hotKeyword",
          entityId: input.id,
          summary: `新增熱門字：${input.text}`,
        });
      }
    },

    upsertStore(input: Omit<AdminStore, "updatedAt">, actor = "admin") {
      const idx = this.stores.findIndex((s) => s.id === input.id);
      const next: AdminStore = { ...input, updatedAt: nowISO() };

      if (idx >= 0) {
        this.stores[idx] = next;
        this.addLog({
          actor,
          action: "update",
          entityType: "store",
          entityId: input.id,
          summary: `更新店家：${input.name}`,
        });
      } else {
        this.stores.push(next);
        this.addLog({
          actor,
          action: "create",
          entityType: "store",
          entityId: input.id,
          summary: `新增店家：${input.name}`,
        });
      }
    },

    removeStore(storeId: string, actor = "admin") {
      const idx = this.stores.findIndex((s) => s.id === storeId);
      if (idx < 0) return;

      const removed = this.stores[idx];

      // ✅ TS 與 runtime 都安全：避免 removed 為 undefined
      if (!removed) return;

      this.stores.splice(idx, 1);

      this.addLog({
        actor,
        action: "delete",
        entityType: "store",
        entityId: storeId,
        summary: `刪除店家：${removed.name}`,
      });
    },

    resolveGroupByKeyword(keyword: string): KeywordGroup | null {
      const key = normalizeText(keyword, this.rules);
      if (!key) return null;

      const groups = this.groups.filter((g) => g.status === "enabled");
      for (const g of groups) {
        const titleKey = normalizeText(g.title, this.rules);
        if (this.rules.exactGroupFirst && titleKey === key) return g;

        for (const a of g.aliases) {
          const aliasKey = normalizeText(a, this.rules);
          if (this.rules.exactGroupFirst && aliasKey === key) return g;
        }
      }

      return null;
    },

    searchStores(keyword: string): AdminStore[] {
      const raw = toSafeText(keyword);
      const key = normalizeText(raw, this.rules);

      if (!key) {
        if (this.rules.emptyKeywordBehavior === "none") return [];
        if (this.rules.emptyKeywordBehavior === "hot") {
          const hotSet = new Set(this.enabledHotKeywords.map((x) => x.text));
          const groupIds = this.enabledGroups
            .filter((g) => hotSet.has(g.title))
            .map((g) => g.id);
          return this.enabledStores.filter((s) => groupIds.includes(s.groupId));
        }
        return this.enabledStores;
      }

      const g = this.resolveGroupByKeyword(key);
      let list = this.enabledStores;

      if (g && this.rules.exactGroupFirst) {
        list = list.filter((s) => s.groupId === g.id);
      } else {
        list = list.filter((s) => {
          const parts: string[] = [];
          if (this.rules.fields.brand) parts.push(s.brand);
          if (this.rules.fields.name) parts.push(s.name);
          if (this.rules.fields.categoryMain) parts.push(s.categoryMain);
          if (this.rules.fields.categorySub) parts.push(s.categorySub);
          if (this.rules.fields.badge) parts.push(s.badge);

          const hay = normalizeText(parts.join(" "), this.rules);
          return matchKeyword(hay, key, this.rules.matchMode);
        });
      }

      const sorted = [...list].sort((a, b) => {
        const dir = this.sort.dir === "asc" ? 1 : -1;

        if (this.sort.field === "weight") return dir * (a.weight - b.weight);
        if (this.sort.field === "rating") return dir * (a.rating - b.rating);
        if (this.sort.field === "distanceKm") return dir * (a.distanceKm - b.distanceKm);
        return dir * a.name.localeCompare(b.name, "zh-Hant");
      });

      return sorted.slice(0, Math.max(1, this.rules.resultLimit));
    },

    toFrontSearchPayload(): FrontSearchPayload {
      const hotKeywords = this.enabledHotKeywords.map((x) => x.text);

      const storesByKeyword: Record<string, FrontStoreCard[]> = {};
      const enabledGroups = this.enabledGroups;

      for (const g of enabledGroups) {
        const groupStores = this.enabledStores
          .filter((s) => s.groupId === g.id)
          .sort((a, b) => b.weight - a.weight)
          .map<FrontStoreCard>((s) => ({
            id: s.id,
            brand: s.brand,
            name: s.name,
            categoryMain: s.categoryMain,
            categorySub: s.categorySub,
            rating: s.rating.toFixed(1),
            distance: kmToDisplay(s.distanceKm),
            badge: s.badge || "",
            coverUrl: s.coverUrl || "",
          }));

        storesByKeyword[g.title] = groupStores;
      }

      return { hotKeywords, storesByKeyword };
    },

    /* ✅ CHART: 需要時重新產生假資料（例如你想按按鈕「重抽趨勢」） */
    reseedAnalytics(rangeDays: TrendRangeDays = 90, seed = 20251227) {
      const keywordPool = [
        ...this.hotKeywords.map((x) => x.text),
        ...this.groups.map((x) => x.title),
        "書店",
        "咖啡",
        "量販",
        "超市",
        "文具",
        "藥妝",
        "生活百貨",
        "家具",
        "停車",
        "親子",
        "附近",
        "連鎖",
      ];

      this.analytics.daily = makeMockAnalyticsDaily({
        days: rangeDays,
        keywordPool,
        seed,
      });
      this.analytics.updatedAt = nowISO();
    },
  },
});
