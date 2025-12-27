// src/stores/adminTicketStore.ts
import { defineStore } from "pinia";

export type TicketStatus = "enabled" | "disabled" | "draft";

export type AdminTicket = {
  id: string;
  title: string;
  subtitle: string;
  points: number;
  imageUrl: string;

  brandId: string;
  categoryIds: string[];

  validFrom: string; // YYYY-MM-DD
  validTo: string; // YYYY-MM-DD

  status: TicketStatus;

  stock: number; // -1 表示不限量（目前先用 0~999）
  redeemedCount: number;

  htmlContent: string;

  updatedAt: string; // YYYY-MM-DD HH:mm
};

export type TicketCategory = { id: string; label: string };

type BrandOption = { id: string; label: string };

type Filters = {
  keyword: string; // title / subtitle / id
  status: "" | TicketStatus;
  brandId: string;
  validState: "" | "valid" | "expired" | "soon";
  pointsMin: string;
  pointsMax: string;
};

type SortDir = "asc" | "desc" | "";
type SortKey =
  | "title"
  | "points"
  | "brand"
  | "validTo"
  | "stock"
  | "redeemedCount"
  | "status"
  | "updatedAt"
  | "";

function includesCI(a: string, b: string) {
  return String(a || "").toLowerCase().includes(String(b || "").toLowerCase());
}

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

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${y}-${m}-${dd}`;
}

function parseYMD(ymd: string) {
  const s = String(ymd || "").trim();
  if (!s) return null;
  const x = s.replace(/\//g, "-");
  const t = Date.parse(x);
  if (Number.isNaN(t)) return null;
  return new Date(t);
}

function normalizeStatusOrder(s: TicketStatus) {
  if (s === "draft") return 0;
  if (s === "enabled") return 1;
  return 2;
}

export const useAdminTicketStore = defineStore("adminTicketStore", {
  state: () => {
    const brands: BrandOption[] = [
      { id: "subway", label: "Subway" },
      { id: "starbucks", label: "星巴克" },
      { id: "showtime", label: "威秀影城" },
      { id: "cosmed", label: "康是美" },
      { id: "spa", label: "SPA會館" },
      { id: "carrefour", label: "家樂福" },
    ];

    // ✅ 補上 categories（你元件正在用）
    const categories: TicketCategory[] = [
      { id: "food", label: "餐飲" },
      { id: "movie", label: "電影娛樂" },
      { id: "shopping", label: "購物" },
      { id: "beauty", label: "美妝保養" },
      { id: "health", label: "健康/SPA" },
      { id: "supermarket", label: "量販超市" },
    ];

    const baseTickets = [
      {
        id: "subway-xinyi",
        title: "Subway信義店",
        subtitle: "PayEasy大吉大利套餐",
        points: 350,
        imageUrl:
          "https://images.unsplash.com/photo-1764344815160-0e2afc6939a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWJ3YXklMjBzYW5kd2ljaCUyMHNob3B8ZW58MXx8fHwxNzY1MTg4ODEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "starbucks-nanjing",
        title: "星巴克南京店",
        subtitle: "中杯咖啡兌換券",
        points: 280,
        imageUrl:
          "https://images.unsplash.com/photo-1581470762681-018024ce84a7?w=1200&h=1200&fit=crop&q=90",
      },
      {
        id: "showtime-xinyi",
        title: "威秀影城信義店",
        subtitle: "電影票兌換券",
        points: 420,
        imageUrl:
          "https://images.unsplash.com/photo-1751823886813-0cfc86cb9478?w=1200&h=1200&fit=crop&q=90",
      },
      {
        id: "cosmed-xiaokao",
        title: "康是美忠孝店",
        subtitle: "購物金兌換券",
        points: 180,
        imageUrl:
          "https://images.unsplash.com/photo-1762420873673-f712e44b5dfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMHN0b3JlJTIwY29sb3JmdWx8ZW58MXx8fHwxNzY1MTg4ODExfDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "spa-daan",
        title: "SPA會館大安店",
        subtitle: "按摩體驗券",
        points: 500,
        imageUrl:
          "https://images.unsplash.com/photo-1757689314932-bec6e9c39e51?w=1200&h=1200&fit=crop&q=90",
      },
      {
        id: "carrefour-guilin",
        title: "家樂福桂林店",
        subtitle: "購物金兌換券",
        points: 280,
        imageUrl:
          "https://images.unsplash.com/photo-1627189783170-b65ff48da3b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBlcm1hcmtldCUyMGNhcnJlZm91ciUyMGNvbG9yZnVsfGVufDF8fHx8MTc2NTE4ODgxMXww&ixlib=rb-4.1.0&q=80&w=1080",
      },
    ];

    const htmlTemplate = (title: string) => {
      const safeTitle = String(title || "票券").trim();
      return `
<div class="section">
  <div class="section-title">使用步驟：</div>
  <ol>
    <li>至門市出示此票券。</li>
    <li>依店員指示進行核銷。</li>
    <li>完成兌換後即失效。</li>
  </ol>
</div>
<div class="section">
  <div class="section-title">使用條款：</div>
  <ul>
    <li>本票券僅限指定門市使用。</li>
    <li>不得與其他優惠併用。</li>
    <li>逾期無效。</li>
    <li>實際規範以門市公告為準。</li>
  </ul>
</div>
<p>（${safeTitle}）</p>
      `.trim();
    };

    const today = new Date();
    const todayYMD = toYMD(today);

    function brandIdFromTicketId(id: string) {
      const s = String(id || "");
      const head = s.split("-")[0] || "";
      return head;
    }

    function validRangeFor(id: string) {
      const startDaysAgo = seededNumber(id + "_vf", 1, 60);
      const durationDays = seededNumber(id + "_vd", 30, 160);

      const from = new Date(today.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
      const to = new Date(from.getTime() + durationDays * 24 * 60 * 60 * 1000);

      return {
        validFrom: toYMD(from),
        validTo: toYMD(to),
      };
    }

    function updatedAtFor(id: string) {
      const daysAgo = seededNumber(id + "_ud", 0, 30);
      const hoursAgo = seededNumber(id + "_uh", 0, 23);
      const minutesAgo = seededNumber(id + "_um", 0, 59);
      const d = new Date(
        today.getTime() - (daysAgo * 24 * 60 + hoursAgo * 60 + minutesAgo) * 60 * 1000
      );
      return formatDateTime(d);
    }

    function statusFor(id: string): TicketStatus {
      const n = seededNumber(id + "_st", 1, 100);
      if (n <= 12) return "draft";
      if (n <= 88) return "enabled";
      return "disabled";
    }

    function stockFor(id: string) {
      const n = seededNumber(id + "_stock", 0, 100);
      if (n <= 8) return -1;
      return seededNumber(id + "_stock2", 30, 999);
    }

    function redeemedFor(id: string, stock: number) {
      if (stock === -1) return seededNumber(id + "_red", 0, 9999);
      return seededNumber(id + "_red2", 0, Math.max(0, stock));
    }

    const items: AdminTicket[] = baseTickets.map((t) => {
      const brandId = brandIdFromTicketId(t.id);
      const vr = validRangeFor(t.id);
      const st = statusFor(t.id);
      const stock = stockFor(t.id);

      const htmlContent =
        t.id === "subway-xinyi"
          ? `
<div class="section">
  <div class="section-title">使用步驟：</div>
  <ol>
    <li>選擇餐點，前往大吉大利堡，選擇您喜愛的滿額套餐。</li>
    <li>結帳前/結帳時，告知服務人員您持有 PayEasy 優惠券，並出示優惠券號碼。</li>
    <li>輸入優惠碼，如果您使用的是電子優惠券，請在結帳時輸入優惠碼或掃描二維碼。</li>
    <li>享受折扣，結帳時，NT$125 元的折扣將自動應用於您的總金額。</li>
    <li>完成兌換後即失效，不可重複使用。</li>
  </ol>
</div>

<div class="section">
  <div class="section-title">使用條款：</div>
  <ul>
    <li>此優惠僅限於大吉大利堡套餐與特定的分店使用。</li>
    <li>優惠券不得與其他優惠或促銷活動合併使用。</li>
    <li>優惠券一經使用即失效，不可重複使用。</li>
    <li>請在有效期限內使用，逾期無效。</li>
  </ul>
</div>
          `.trim()
          : htmlTemplate(t.subtitle);

      return {
        id: t.id,
        title: t.title,
        subtitle: t.subtitle,
        points: t.points,
        imageUrl: t.imageUrl,
        brandId,
        categoryIds: [],
        validFrom: vr.validFrom,
        validTo: vr.validTo,
        status: st,
        stock,
        redeemedCount: redeemedFor(t.id, stock),
        htmlContent,
        updatedAt: updatedAtFor(t.id),
      };
    });

    return {
      items,
      brands,
      categories, // ✅ 回傳 categories
      todayYMD,

      filters: {
        keyword: "",
        status: "",
        brandId: "",
        validState: "",
        pointsMin: "",
        pointsMax: "",
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
    brandLabelMap(state) {
      const map: Record<string, string> = {};
      for (const b of state.brands) map[b.id] = b.label;
      return map;
    },

    // ✅ 補上 categoryLabelMap（你元件正在用）
    categoryLabelMap(state) {
      const map: Record<string, string> = {};
      for (const c of state.categories) map[c.id] = c.label;
      return map;
    },

    isExpired(state) {
      return (t: AdminTicket) => {
        const to = parseYMD(t.validTo);
        const today = parseYMD(state.todayYMD);
        if (!to || !today) return false;
        return to.getTime() < today.getTime();
      };
    },

    validStateOf(state) {
      return (t: AdminTicket): "valid" | "expired" | "soon" => {
        const to = parseYMD(t.validTo);
        const today = parseYMD(state.todayYMD);
        if (!to || !today) return "valid";

        if (to.getTime() < today.getTime()) return "expired";

        const diffDays = Math.floor((to.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays <= 7) return "soon";
        return "valid";
      };
    },

    filteredItems(state): AdminTicket[] {
      const kw = String(state.filters.keyword || "").trim();
      const status = state.filters.status;
      const brandId = String(state.filters.brandId || "").trim();
      const validState = state.filters.validState;

      const pMin = String(state.filters.pointsMin || "").trim();
      const pMax = String(state.filters.pointsMax || "").trim();
      const minPoints = pMin ? Number(pMin) : null;
      const maxPoints = pMax ? Number(pMax) : null;

      let arr = state.items.slice();

      if (kw) {
        arr = arr.filter(
          (x) => includesCI(x.title, kw) || includesCI(x.subtitle, kw) || includesCI(x.id, kw)
        );
      }

      if (status) {
        arr = arr.filter((x) => x.status === status);
      }

      if (brandId) {
        arr = arr.filter((x) => x.brandId === brandId);
      }

      if (validState) {
        arr = arr.filter((x) => this.validStateOf(x) === validState);
      }

      if (minPoints !== null && !Number.isNaN(minPoints)) {
        arr = arr.filter((x) => Number(x.points) >= minPoints);
      }

      if (maxPoints !== null && !Number.isNaN(maxPoints)) {
        arr = arr.filter((x) => Number(x.points) <= maxPoints);
      }

      const key = state.sort.key;
      const dir = state.sort.dir;

      if (key && dir) {
        const factor = dir === "asc" ? 1 : -1;

        arr.sort((a, b) => {
          let va: any = null;
          let vb: any = null;

          if (key === "title") {
            va = a.title;
            vb = b.title;
          } else if (key === "points") {
            va = a.points;
            vb = b.points;
          } else if (key === "brand") {
            va = this.brandLabelMap[a.brandId] || a.brandId;
            vb = this.brandLabelMap[b.brandId] || b.brandId;
          } else if (key === "validTo") {
            va = a.validTo;
            vb = b.validTo;
          } else if (key === "stock") {
            va = a.stock === -1 ? Number.MAX_SAFE_INTEGER : a.stock;
            vb = b.stock === -1 ? Number.MAX_SAFE_INTEGER : b.stock;
          } else if (key === "redeemedCount") {
            va = a.redeemedCount;
            vb = b.redeemedCount;
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

    pageItems(state): AdminTicket[] {
      const p = Math.min(Math.max(1, Number(state.page) || 1), this.pageCount);
      const size = Math.max(1, Number(state.pageSize) || 10);
      const start = (p - 1) * size;
      const end = start + size;
      return this.filteredItems.slice(start, end);
    },

    getById(state) {
      return (id: string) => {
        const target = String(id || "");
        return state.items.find((x) => x.id === target) || null;
      };
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
      this.filters.brandId = "";
      this.filters.validState = "";
      this.filters.pointsMin = "";
      this.filters.pointsMax = "";
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
        "title",
        "points",
        "brand",
        "validTo",
        "stock",
        "redeemedCount",
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

    upsertTicket(payload: Partial<AdminTicket> & { id: string }) {
      const id = String(payload.id || "");
      if (!id) return;

      const idx = this.items.findIndex((x) => x.id === id);

      if (idx >= 0) {
        const prev = this.items[idx];
        if (!prev) return;

        const next: AdminTicket = {
          ...prev,
          ...payload,
          categoryIds: Array.isArray(payload.categoryIds) ? payload.categoryIds : prev.categoryIds,
          title: payload.title ?? prev.title,
          subtitle: payload.subtitle ?? prev.subtitle,
          points: payload.points ?? prev.points,
          imageUrl: payload.imageUrl ?? prev.imageUrl,
          brandId: payload.brandId ?? prev.brandId,
          validFrom: payload.validFrom ?? prev.validFrom,
          validTo: payload.validTo ?? prev.validTo,
          status: payload.status ?? prev.status,
          stock: payload.stock ?? prev.stock,
          redeemedCount: payload.redeemedCount ?? prev.redeemedCount,
          htmlContent: payload.htmlContent ?? prev.htmlContent,
          updatedAt: payload.updatedAt ?? prev.updatedAt,
        };

        this.items.splice(idx, 1, next);
        return;
      }

      const created: AdminTicket = {
        id,
        title: payload.title ?? "未命名票券",
        subtitle: payload.subtitle ?? "",
        points: payload.points ?? 0,
        imageUrl: payload.imageUrl ?? "",
        brandId: payload.brandId ?? "",
        categoryIds: Array.isArray(payload.categoryIds) ? payload.categoryIds : [],
        validFrom: payload.validFrom ?? toYMD(new Date()),
        validTo: payload.validTo ?? toYMD(new Date()),
        status: payload.status ?? "draft",
        stock: payload.stock ?? 0,
        redeemedCount: payload.redeemedCount ?? 0,
        htmlContent: payload.htmlContent ?? "",
        updatedAt: payload.updatedAt ?? formatDateTime(new Date()),
      };

      this.items.unshift(created);
    },

    removeTicket(id: string) {
      const target = String(id || "");
      if (!target) return;

      this.items = this.items.filter((x) => x.id !== target);
      this.selectedIds = this.selectedIds.filter((x) => x !== target);

      const pc = this.pageCount;
      if (this.page > pc) this.page = pc;
    },
  },
});
