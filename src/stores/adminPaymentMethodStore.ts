import { defineStore } from "pinia";

export type PaymentMethodStatus = "enabled" | "disabled" | "draft";
export type PaymentMethodType = "online" | "offline" | "bank";
export type Channel = "web" | "ios" | "android";
export type FeeType = "none" | "percent" | "fixed" | "mixed";

export type BrandOption = { id: string; label: string };

export type FeeRule = {
  enabled: boolean;
  type: FeeType;
  percent: number;
  fixedAmount: number;
  capAmount: number;
};

export type LimitRule = {
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  dailyLimitAmount: number;
  perUserDailyCount: number;
  require3DS: boolean;
};

export type RefundRule = {
  refundable: boolean;
  refundDaysLimit: number;
  manualReviewRefund: boolean;
};

export type PaymentScope = {
  brandIds: string[];
  channels: Channel[];
  memberLevels: string[];
};

export type PaymentLog = {
  id: string;
  actor: string;
  action: string;
  at: string;
  summary: string;
};

export type AdminPaymentMethod = {
  id: string;
  name: string;
  description: string;
  type: PaymentMethodType;
  provider: string;
  iconUrl: string;
  order: number;
  status: PaymentMethodStatus;
  scope: PaymentScope;
  fee: FeeRule;
  limits: LimitRule;
  refund: RefundRule;
  updatedAt: string;
  logs: PaymentLog[];
};

type Filters = {
  keyword: string;
  status: "" | PaymentMethodStatus;
  type: "" | PaymentMethodType;
  provider: string;
  brandId: string;
  channel: "" | Channel;
  feeEnabled: "" | "yes" | "no";
  limitEnabled: "" | "yes" | "no";
};

type SortDir = "asc" | "desc" | "";
type SortKey =
  | "order"
  | "name"
  | "type"
  | "provider"
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

function normalizeStatusOrder(s: PaymentMethodStatus) {
  if (s === "draft") return 0;
  if (s === "enabled") return 1;
  return 2;
}

function uniq<T>(arr: T[]): T[] {
  const set = new Set(arr);
  return Array.from(set);
}

function feeText(fee: FeeRule): string {
  if (!fee.enabled || fee.type === "none") return "無";
  const cap = fee.capAmount > 0 ? `（上限 ${fee.capAmount}）` : "";
  if (fee.type === "percent") return `${fee.percent}%${cap}`;
  if (fee.type === "fixed") return `${fee.fixedAmount}${cap}`;
  if (fee.type === "mixed") return `${fee.fixedAmount} + ${fee.percent}%${cap}`;
  return "無";
}

function makeLog(seed: string, actor: string, action: string, summary: string, now: Date): PaymentLog {
  const minutesAgo = seededNumber(seed + "_m", 0, 8000);
  const d = new Date(now.getTime() - minutesAgo * 60 * 1000);
  return {
    id: `log_${seed}_${minutesAgo}`,
    actor,
    action,
    at: formatDateTime(d),
    summary,
  };
}

export const useAdminPaymentMethodStore = defineStore("adminPaymentMethodStore", {
  state: () => {
    const brands: BrandOption[] = [
      { id: "subway", label: "Subway" },
      { id: "starbucks", label: "星巴克" },
      { id: "showtime", label: "威秀影城" },
      { id: "cosmed", label: "康是美" },
      { id: "spa", label: "SPA會館" },
      { id: "carrefour", label: "家樂福" },
    ];

    const now = new Date();

    const base = [
      {
        id: "card_stripe",
        name: "信用卡（Stripe）",
        description: "支援 Visa / Master / JCB",
        type: "online" as PaymentMethodType,
        provider: "stripe",
        iconUrl: "https://i.pinimg.com/736x/02/28/bb/0228bb6b35ac88ba67f3448ae44c09f7.jpg",
      },
      {
        id: "card_newebpay",
        name: "信用卡（藍新）",
        description: "後台對帳與退款流程走藍新",
        type: "online" as PaymentMethodType,
        provider: "newebpay",
        iconUrl: "https://i.pinimg.com/736x/0a/10/25/0a10252992682c79c9bb239473de2ae2.jpg",
      },
      {
        id: "apple_pay",
        name: "Apple Pay",
        description: "僅 iOS 通路",
        type: "online" as PaymentMethodType,
        provider: "apple",
        iconUrl: "https://i.pinimg.com/1200x/f3/4c/61/f34c616439462a2aec30e0a62cfc627a.jpg",
      },
      {
        id: "google_pay",
        name: "Google Pay",
        description: "僅 Android 通路",
        type: "online" as PaymentMethodType,
        provider: "google",
        iconUrl: "https://i.pinimg.com/1200x/b4/9e/2c/b49e2c718efad0eadd5c94eb0cea8954.jpg",
      },
      {
        id: "line_pay",
        name: "LINE Pay",
        description: "行動支付（Web + App）",
        type: "online" as PaymentMethodType,
        provider: "linepay",
        iconUrl: "https://i.pinimg.com/1200x/32/c3/b4/32c3b49795d124f69dd7c0a8052f9d96.jpg",
      },
      {
        id: "jko_pay",
        name: "街口支付",
        description: "行動支付",
        type: "online" as PaymentMethodType,
        provider: "jkopay",
        iconUrl: "https://i.pinimg.com/736x/71/20/23/712023f093606de969ec483377325c5c.jpg",
      },
      {
        id: "atm_transfer",
        name: "ATM 轉帳",
        description: "下單後提供虛擬帳號",
        type: "bank" as PaymentMethodType,
        provider: "bank",
        iconUrl: "https://i.pinimg.com/736x/2a/42/af/2a42afbab20a2536d83b484df3db8ed5.jpg",
      },
      {
        id: "cash_store",
        name: "門市現金",
        description: "到店付款",
        type: "offline" as PaymentMethodType,
        provider: "store",
        iconUrl: "https://i.pinimg.com/736x/f6/7f/4a/f67f4abbb9f12b1c33befe9f6f14de2e.jpg",
      },
      {
        id: "manual_pay",
        name: "人工收款（草稿）",
        description: "客服手動收款用（尚未上線）",
        type: "offline" as PaymentMethodType,
        provider: "manual",
        iconUrl: "https://i.pinimg.com/736x/9d/46/d6/9d46d648b6bae2baad0e16c7ab5db3e6.jpg",
      },
    ];

    const items: AdminPaymentMethod[] = base.map((b, idx) => {
      const stN = seededNumber(b.id + "_st", 1, 100);
      const status: PaymentMethodStatus = stN <= 14 ? "draft" : stN <= 86 ? "enabled" : "disabled";

      const order = idx + 1;

      const channels: Channel[] =
        b.id === "apple_pay"
          ? ["ios"]
          : b.id === "google_pay"
          ? ["android"]
          : b.id === "cash_store" || b.id === "pos_card"
          ? ["web"]
          : ["web", "ios", "android"];

      const feeEnabledN = seededNumber(b.id + "_feeE", 1, 100);
      const feeEnabled = feeEnabledN <= 65;

      const feeTypeN = seededNumber(b.id + "_feeT", 1, 100);
      const feeType: FeeType = !feeEnabled
        ? "none"
        : feeTypeN <= 40
        ? "percent"
        : feeTypeN <= 70
        ? "fixed"
        : "mixed";

      const fee: FeeRule = {
        enabled: feeEnabled,
        type: feeType,
        percent: feeEnabled ? seededNumber(b.id + "_p", 1, 5) : 0,
        fixedAmount: feeEnabled ? seededNumber(b.id + "_f", 10, 60) : 0,
        capAmount: feeEnabled ? (seededNumber(b.id + "_cap", 1, 100) <= 50 ? seededNumber(b.id + "_cap2", 50, 200) : 0) : 0,
      };

      const limitEnabled = seededNumber(b.id + "_limE", 1, 100) <= 55;

      const limits: LimitRule = {
        enabled: limitEnabled,
        minAmount: limitEnabled ? seededNumber(b.id + "_min", 0, 200) : 0,
        maxAmount: limitEnabled ? seededNumber(b.id + "_max", 2000, 50000) : 0,
        dailyLimitAmount: limitEnabled ? seededNumber(b.id + "_d", 30000, 300000) : 0,
        perUserDailyCount: limitEnabled ? seededNumber(b.id + "_c", 1, 20) : 0,
        require3DS: b.id.includes("card") ? seededNumber(b.id + "_3ds", 1, 100) <= 55 : false,
      };

      const refund: RefundRule = {
        refundable: b.type !== "offline",
        refundDaysLimit: b.type !== "offline" ? seededNumber(b.id + "_rd", 1, 60) : 0,
        manualReviewRefund: seededNumber(b.id + "_mr", 1, 100) <= 35,
      };

      const brandPickN = seededNumber(b.id + "_brand", 1, 100);
      const brandIds =
        brandPickN <= 25
          ? []
          : brandPickN <= 55
          ? [brands[seededNumber(b.id + "_b1", 0, brands.length - 1)]?.id || ""].filter(Boolean)
          : uniq([
              brands[seededNumber(b.id + "_b2", 0, brands.length - 1)]?.id || "",
              brands[seededNumber(b.id + "_b3", 0, brands.length - 1)]?.id || "",
            ]).filter(Boolean);

      const memberLevels = seededNumber(b.id + "_ml", 1, 100) <= 50 ? [] : ["silver", "gold"];

      const updatedDaysAgo = seededNumber(b.id + "_ud", 0, 20);
      const updatedHoursAgo = seededNumber(b.id + "_uh", 0, 23);
      const updatedMinsAgo = seededNumber(b.id + "_um", 0, 59);
      const updatedAt = formatDateTime(
        new Date(now.getTime() - (updatedDaysAgo * 24 * 60 + updatedHoursAgo * 60 + updatedMinsAgo) * 60 * 1000)
      );

      const logs: PaymentLog[] = [
        makeLog(b.id + "_l1", "admin@system", "建立", "建立付款方式設定", now),
        makeLog(b.id + "_l2", "ops@system", "更新", `調整排序為 ${order}`, now),
        makeLog(b.id + "_l3", "ops@system", "更新", `狀態：${status}`, now),
      ].sort((a, c) => c.at.localeCompare(a.at));

      return {
        id: b.id,
        name: b.name,
        description: b.description,
        type: b.type,
        provider: b.provider,
        iconUrl: b.iconUrl,
        order,
        status,
        scope: {
          brandIds,
          channels,
          memberLevels,
        },
        fee,
        limits,
        refund,
        updatedAt,
        logs,
      };
    });

    return {
      items,
      brands,

      filters: {
        keyword: "",
        status: "",
        type: "",
        provider: "",
        brandId: "",
        channel: "",
        feeEnabled: "",
        limitEnabled: "",
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

    kpi(state) {
      const enabled = state.items.filter((x) => x.status === "enabled").length;
      const disabled = state.items.filter((x) => x.status === "disabled").length;
      const draft = state.items.filter((x) => x.status === "draft").length;

      const feeEnabled = state.items.filter((x) => x.fee.enabled && x.fee.type !== "none").length;
      const limitEnabled = state.items.filter((x) => x.limits.enabled).length;

      const now = new Date();
      const recent7 = state.items.filter((x) => {
        const t = Date.parse(String(x.updatedAt || "").replace(/\//g, "-"));
        if (Number.isNaN(t)) return false;
        return now.getTime() - t <= 7 * 24 * 60 * 60 * 1000;
      }).length;

      return { enabled, disabled, draft, feeEnabled, limitEnabled, recent7 };
    },

    feeTextOf() {
      return (m: AdminPaymentMethod) => feeText(m.fee);
    },

    hasFee() {
      return (m: AdminPaymentMethod) => Boolean(m.fee.enabled && m.fee.type !== "none");
    },

    hasLimits() {
      return (m: AdminPaymentMethod) => Boolean(m.limits.enabled);
    },

    filteredItems(state): AdminPaymentMethod[] {
      const kw = String(state.filters.keyword || "").trim();
      const status = state.filters.status;
      const type = state.filters.type;
      const provider = String(state.filters.provider || "").trim();
      const brandId = String(state.filters.brandId || "").trim();
      const channel = state.filters.channel;
      const feeEnabled = state.filters.feeEnabled;
      const limitEnabled = state.filters.limitEnabled;

      let arr = state.items.slice();

      if (kw) {
        arr = arr.filter((x) => includesCI(x.id, kw) || includesCI(x.name, kw) || includesCI(x.provider, kw));
      }

      if (status) arr = arr.filter((x) => x.status === status);
      if (type) arr = arr.filter((x) => x.type === type);

      if (provider) {
        arr = arr.filter((x) => includesCI(x.provider, provider));
      }

      if (brandId) {
        arr = arr.filter((x) => x.scope.brandIds.includes(brandId));
      }

      if (channel) {
        arr = arr.filter((x) => x.scope.channels.includes(channel));
      }

      if (feeEnabled) {
        arr = arr.filter((x) => {
          const yes = x.fee.enabled && x.fee.type !== "none";
          return feeEnabled === "yes" ? yes : !yes;
        });
      }

      if (limitEnabled) {
        arr = arr.filter((x) => (limitEnabled === "yes" ? x.limits.enabled : !x.limits.enabled));
      }

      const key = state.sort.key;
      const dir = state.sort.dir;

      if (key && dir) {
        const factor = dir === "asc" ? 1 : -1;

        arr.sort((a, b) => {
          let va: string | number = "";
          let vb: string | number = "";

          if (key === "order") {
            va = a.order;
            vb = b.order;
          } else if (key === "name") {
            va = a.name;
            vb = b.name;
          } else if (key === "type") {
            va = a.type;
            vb = b.type;
          } else if (key === "provider") {
            va = a.provider;
            vb = b.provider;
          } else if (key === "status") {
            va = normalizeStatusOrder(a.status);
            vb = normalizeStatusOrder(b.status);
          } else if (key === "updatedAt") {
            va = a.updatedAt;
            vb = b.updatedAt;
          }

          if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb) * factor;
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

    pageItems(state): AdminPaymentMethod[] {
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
      this.filters = { ...this.filters, ...payload };
    },

    applyFilters() {
      this.page = 1;
      const pc = this.pageCount;
      if (this.page > pc) this.page = pc;
    },

    resetFilters() {
      this.filters.keyword = "";
      this.filters.status = "";
      this.filters.type = "";
      this.filters.provider = "";
      this.filters.brandId = "";
      this.filters.channel = "";
      this.filters.feeEnabled = "";
      this.filters.limitEnabled = "";
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
      const allowed: SortKey[] = ["order", "name", "type", "provider", "status", "updatedAt", ""];
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

    addLog(methodId: string, action: string, summary: string, actor = "admin@system") {
      const target = String(methodId || "");
      const idx = this.items.findIndex((x) => x.id === target);
      if (idx < 0) return;

      const now = new Date();
      const log: PaymentLog = {
        id: `log_${target}_${now.getTime()}`,
        actor,
        action,
        at: formatDateTime(now),
        summary,
      };

      const prev = this.items[idx];
      if (!prev) return;

      const next: AdminPaymentMethod = {
        ...prev,
        logs: [log, ...(prev.logs || [])].slice(0, 50),
        updatedAt: formatDateTime(now),
      };

      this.items.splice(idx, 1, next);
    },

    upsertMethod(payload: Partial<AdminPaymentMethod> & { id: string }) {
      const id = String(payload.id || "").trim();
      if (!id) return;

      const idx = this.items.findIndex((x) => x.id === id);

      if (idx >= 0) {
        const prev = this.items[idx];
        if (!prev) return;

        const next: AdminPaymentMethod = {
          ...prev,
          ...payload,
          scope: {
            brandIds: Array.isArray(payload.scope?.brandIds) ? payload.scope!.brandIds : prev.scope.brandIds,
            channels: Array.isArray(payload.scope?.channels) ? payload.scope!.channels : prev.scope.channels,
            memberLevels: Array.isArray(payload.scope?.memberLevels) ? payload.scope!.memberLevels : prev.scope.memberLevels,
          },
          fee: {
            ...prev.fee,
            ...(payload.fee || {}),
          },
          limits: {
            ...prev.limits,
            ...(payload.limits || {}),
          },
          refund: {
            ...prev.refund,
            ...(payload.refund || {}),
          },
          logs: Array.isArray(payload.logs) ? payload.logs : prev.logs,
          updatedAt: payload.updatedAt ?? formatDateTime(new Date()),
        };

        this.items.splice(idx, 1, next);
        this.addLog(id, "更新", "更新付款方式設定");
        return;
      }

      const now = new Date();

      const created: AdminPaymentMethod = {
        id,
        name: payload.name ?? "未命名付款方式",
        description: payload.description ?? "",
        type: payload.type ?? "online",
        provider: payload.provider ?? "custom",
        iconUrl: payload.iconUrl ?? "",
        order: payload.order ?? (this.items.length + 1),
        status: payload.status ?? "draft",
        scope: payload.scope ?? { brandIds: [], channels: ["web"], memberLevels: [] },
        fee: payload.fee ?? { enabled: false, type: "none", percent: 0, fixedAmount: 0, capAmount: 0 },
        limits:
          payload.limits ??
          { enabled: false, minAmount: 0, maxAmount: 0, dailyLimitAmount: 0, perUserDailyCount: 0, require3DS: false },
        refund: payload.refund ?? { refundable: true, refundDaysLimit: 7, manualReviewRefund: false },
        updatedAt: payload.updatedAt ?? formatDateTime(now),
        logs:
          payload.logs ??
          [
            {
              id: `log_${id}_${now.getTime()}`,
              actor: "admin@system",
              action: "建立",
              at: formatDateTime(now),
              summary: "建立付款方式設定",
            },
          ],
      };

      this.items.unshift(created);
      this.addLog(id, "建立", "建立付款方式設定");
    },

    duplicateMethod(id: string) {
      const target = String(id || "");
      const prev = this.items.find((x) => x.id === target);
      if (!prev) return;

      const now = new Date();
      const nextId = `${prev.id}_copy_${seededNumber(prev.id + "_cp", 10, 99)}`;

      const created: AdminPaymentMethod = {
        ...prev,
        id: nextId,
        name: `${prev.name}（複製）`,
        status: "draft",
        updatedAt: formatDateTime(now),
        logs: [
          {
            id: `log_${nextId}_${now.getTime()}`,
            actor: "admin@system",
            action: "複製",
            at: formatDateTime(now),
            summary: `由 ${prev.id} 複製建立`,
          },
          ...(prev.logs || []),
        ].slice(0, 50),
      };

      this.items.unshift(created);
    },

    setStatus(id: string, status: PaymentMethodStatus) {
      const target = String(id || "");
      const idx = this.items.findIndex((x) => x.id === target);
      if (idx < 0) return;

      const prev = this.items[idx];
      if (!prev) return;

      const next: AdminPaymentMethod = {
        ...prev,
        status,
        updatedAt: formatDateTime(new Date()),
      };

      this.items.splice(idx, 1, next);
      this.addLog(target, "更新", `狀態改為 ${status}`);
    },

    removeMethod(id: string) {
      const target = String(id || "");
      if (!target) return;

      this.items = this.items.filter((x) => x.id !== target);
      this.selectedIds = this.selectedIds.filter((x) => x !== target);

      const pc = this.pageCount;
      if (this.page > pc) this.page = pc;
    },

    bulkSetStatus(status: PaymentMethodStatus) {
      const ids = this.selectedIds.slice();
      for (const id of ids) this.setStatus(id, status);
      this.clearSelection();
    },

    bulkRemove() {
      const ids = this.selectedIds.slice();
      for (const id of ids) this.removeMethod(id);
      this.clearSelection();
    },
  },
});
