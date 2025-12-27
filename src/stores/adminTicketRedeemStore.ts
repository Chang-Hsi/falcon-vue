// src/stores/adminTicketRedeemStore.ts
import { defineStore } from "pinia";

export type RedemptionStatus =
  | "issued" // 已兌換到手、未核銷
  | "redeemed" // 已核銷
  | "expired" // 已過期
  | "void" // 作廢/取消
  | "refunded" // 已退點
  | "failed"; // 核銷失敗

export type RedeemChannel = "store" | "online" | "pos" | "manual";

export type MaskedMember = {
  memberId: string;
  name: string;
  phone: string;
  email: string;
};

export type AdminRedemption = {
  id: string; // EX-20251227-000231
  ticketId: string;

  // snapshot (避免依賴 ticket store，列表用起來更像真的後台)
  ticketTitle: string;
  ticketSubtitle: string;
  ticketImageUrl: string;
  brandId: string;
  points: number;
  validFrom: string; // YYYY-MM-DD
  validTo: string; // YYYY-MM-DD

  member: MaskedMember;

  status: RedemptionStatus;
  channel: RedeemChannel;

  storeName: string; // 信義門市 / 南京門市...
  operatorName: string; // 核銷人員（假）

  code: string; // 兌換碼（假）
  createdAt: string; // YYYY-MM-DD HH:mm
  redeemedAt: string | null; // YYYY-MM-DD HH:mm | null

  note: string;
};

type BrandOption = { id: string; label: string };

type Filters = {
  keyword: string; // 兌換單號 / ticketId / 票券名稱 / 會員姓名 / phone / email / code
  status: "" | RedemptionStatus;
  brandId: string;
  ticketId: string;
  channel: "" | RedeemChannel;

  validState: "" | "valid" | "expired" | "soon";

  createdFrom: string; // YYYY-MM-DD
  createdTo: string; // YYYY-MM-DD
  redeemedFrom: string; // YYYY-MM-DD
  redeemedTo: string; // YYYY-MM-DD

  pointsMin: string;
  pointsMax: string;
};

type SortDir = "asc" | "desc" | "";
type SortKey =
  | "createdAt"
  | "redeemedAt"
  | "points"
  | "status"
  | "brand"
  | "ticketTitle"
  | "validTo"
  | "memberName"
  | "";

function includesCI(a: string, b: string): boolean {
  return String(a || "").toLowerCase().includes(String(b || "").toLowerCase());
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${y}-${m}-${dd}`;
}

function formatDateTime(d: Date): string {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${y}-${m}-${dd} ${hh}:${mm}`;
}

function parseYMD(ymd: string): Date | null {
  const s = String(ymd || "").trim();
  if (!s) return null;
  const x = s.replace(/\//g, "-");
  const t = Date.parse(x);
  if (Number.isNaN(t)) return null;
  return new Date(t);
}

function parseDT(dt: string | null): Date | null {
  const s = String(dt || "").trim();
  if (!s) return null;
  const x = s.replace(/\//g, "-");
  const t = Date.parse(x);
  if (Number.isNaN(t)) return null;
  return new Date(t);
}

function seededNumber(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const r = h % 10000;
  const t = r / 9999;
  return Math.floor(min + t * (max - min));
}

function normalizeStatusOrder(s: RedemptionStatus): number {
  // 你也可以調整排序偏好
  if (s === "issued") return 0;
  if (s === "redeemed") return 1;
  if (s === "failed") return 2;
  if (s === "refunded") return 3;
  if (s === "void") return 4;
  return 5; // expired
}

function safeClamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function validStateByTo(todayYMD: string, validTo: string): "valid" | "expired" | "soon" {
  const to = parseYMD(validTo);
  const today = parseYMD(todayYMD);
  if (!to || !today) return "valid";

  if (to.getTime() < today.getTime()) return "expired";

  const diffDays = Math.floor((to.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 7) return "soon";
  return "valid";
}

type KPI = {
  issued: number;
  redeemed: number;
  expired: number;
  void: number;
  refunded: number;
  failed: number;
  total: number;
  expiringSoon7: number;
  redeemedToday: number;
};

export const useAdminTicketRedeemStore = defineStore("adminTicketRedeemStore", {
  state: () => {
    const brands: BrandOption[] = [
      { id: "subway", label: "Subway" },
      { id: "starbucks", label: "星巴克" },
      { id: "showtime", label: "威秀影城" },
      { id: "cosmed", label: "康是美" },
      { id: "spa", label: "SPA會館" },
      { id: "carrefour", label: "家樂福" },
    ];

    const today = new Date();
    const todayYMD = toYMD(today);

    return {
      brands,
      todayYMD,

      items: [] as AdminRedemption[],

      filters: {
        keyword: "",
        status: "",
        brandId: "",
        ticketId: "",
        channel: "",
        validState: "",
        createdFrom: "",
        createdTo: "",
        redeemedFrom: "",
        redeemedTo: "",
        pointsMin: "",
        pointsMax: "",
      } as Filters,

      sort: {
        key: "createdAt" as SortKey,
        dir: "desc" as SortDir,
      },

      page: 1,
      pageSize: 10,

      selectedIds: [] as string[],
    };
  },

  getters: {
    brandLabelMap(state): Record<string, string> {
      const map: Record<string, string> = {};
      for (const b of state.brands) map[b.id] = b.label;
      return map;
    },

    kpi(state): KPI {
      let issued = 0;
      let redeemed = 0;
      let expired = 0;
      let v = 0;
      let refunded = 0;
      let failed = 0;

      let expiringSoon7 = 0;
      let redeemedToday = 0;

      for (const it of state.items) {
        if (it.status === "issued") issued += 1;
        else if (it.status === "redeemed") redeemed += 1;
        else if (it.status === "expired") expired += 1;
        else if (it.status === "void") v += 1;
        else if (it.status === "refunded") refunded += 1;
        else if (it.status === "failed") failed += 1;

        const vs = validStateByTo(state.todayYMD, it.validTo);
        if (vs === "soon") expiringSoon7 += 1;

        if (it.status === "redeemed" && it.redeemedAt) {
          const ymd = String(it.redeemedAt).slice(0, 10);
          if (ymd === state.todayYMD) redeemedToday += 1;
        }
      }

      return {
        issued,
        redeemed,
        expired,
        void: v,
        refunded,
        failed,
        total: state.items.length,
        expiringSoon7,
        redeemedToday,
      };
    },

    validStateOf(state) {
      return (it: AdminRedemption): "valid" | "expired" | "soon" => {
        return validStateByTo(state.todayYMD, it.validTo);
      };
    },

    filteredItems(state): AdminRedemption[] {
      const kw = String(state.filters.keyword || "").trim();
      const status = state.filters.status;
      const brandId = String(state.filters.brandId || "").trim();
      const ticketId = String(state.filters.ticketId || "").trim();
      const channel = state.filters.channel;
      const validState = state.filters.validState;

      const pMin = String(state.filters.pointsMin || "").trim();
      const pMax = String(state.filters.pointsMax || "").trim();
      const minPoints = pMin ? Number(pMin) : null;
      const maxPoints = pMax ? Number(pMax) : null;

      const createdFrom = parseYMD(state.filters.createdFrom);
      const createdTo = parseYMD(state.filters.createdTo);
      const redeemedFrom = parseYMD(state.filters.redeemedFrom);
      const redeemedTo = parseYMD(state.filters.redeemedTo);

      let arr = state.items.slice();

      if (kw) {
        arr = arr.filter((x) => {
          return (
            includesCI(x.id, kw) ||
            includesCI(x.ticketId, kw) ||
            includesCI(x.ticketTitle, kw) ||
            includesCI(x.ticketSubtitle, kw) ||
            includesCI(x.member.memberId, kw) ||
            includesCI(x.member.name, kw) ||
            includesCI(x.member.phone, kw) ||
            includesCI(x.member.email, kw) ||
            includesCI(x.code, kw)
          );
        });
      }

      if (status) arr = arr.filter((x) => x.status === status);
      if (brandId) arr = arr.filter((x) => x.brandId === brandId);
      if (ticketId) arr = arr.filter((x) => x.ticketId === ticketId);
      if (channel) arr = arr.filter((x) => x.channel === channel);

      if (validState) {
        arr = arr.filter((x) => validStateByTo(state.todayYMD, x.validTo) === validState);
      }

      if (minPoints !== null && !Number.isNaN(minPoints)) {
        arr = arr.filter((x) => Number(x.points) >= minPoints);
      }
      if (maxPoints !== null && !Number.isNaN(maxPoints)) {
        arr = arr.filter((x) => Number(x.points) <= maxPoints);
      }

      if (createdFrom || createdTo) {
        arr = arr.filter((x) => {
          const d = parseDT(x.createdAt);
          if (!d) return false;
          const t = d.getTime();

          if (createdFrom) {
            const fromT = createdFrom.getTime();
            if (t < fromT) return false;
          }
          if (createdTo) {
            const toT = createdTo.getTime() + 24 * 60 * 60 * 1000 - 1;
            if (t > toT) return false;
          }
          return true;
        });
      }

      if (redeemedFrom || redeemedTo) {
        arr = arr.filter((x) => {
          const d = parseDT(x.redeemedAt);
          if (!d) return false;
          const t = d.getTime();

          if (redeemedFrom) {
            const fromT = redeemedFrom.getTime();
            if (t < fromT) return false;
          }
          if (redeemedTo) {
            const toT = redeemedTo.getTime() + 24 * 60 * 60 * 1000 - 1;
            if (t > toT) return false;
          }
          return true;
        });
      }

      const key = state.sort.key;
      const dir = state.sort.dir;

      if (key && dir) {
        const factor = dir === "asc" ? 1 : -1;

        arr.sort((a, b) => {
          let va: string | number | null = null;
          let vb: string | number | null = null;

          if (key === "createdAt") {
            va = a.createdAt;
            vb = b.createdAt;
          } else if (key === "redeemedAt") {
            va = a.redeemedAt || "";
            vb = b.redeemedAt || "";
          } else if (key === "points") {
            va = a.points;
            vb = b.points;
          } else if (key === "status") {
            va = normalizeStatusOrder(a.status);
            vb = normalizeStatusOrder(b.status);
          } else if (key === "brand") {
            va = (state as any).brandLabelMap?.[a.brandId] || a.brandId;
            vb = (state as any).brandLabelMap?.[b.brandId] || b.brandId;
          } else if (key === "ticketTitle") {
            va = a.ticketTitle;
            vb = b.ticketTitle;
          } else if (key === "validTo") {
            va = a.validTo;
            vb = b.validTo;
          } else if (key === "memberName") {
            va = a.member.name;
            vb = b.member.name;
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

    pageItems(state): AdminRedemption[] {
      const pc = this.pageCount;
      const p = safeClamp(Number(state.page) || 1, 1, pc);
      const size = Math.max(1, Number(state.pageSize) || 10);
      const start = (p - 1) * size;
      const end = start + size;
      return this.filteredItems.slice(start, end);
    },

    getById(state) {
      return (id: string): AdminRedemption | null => {
        const target = String(id || "");
        return state.items.find((x) => x.id === target) || null;
      };
    },

    isSelected(state) {
      return (id: string): boolean => state.selectedIds.includes(id);
    },

    isAllSelectedOnPage(state): boolean {
      const ids = this.pageItems.map((x) => x.id);
      if (!ids.length) return false;
      return ids.every((id) => state.selectedIds.includes(id));
    },
  },

  actions: {
    ensureSeeded(tickets: Array<{
      id: string;
      title: string;
      subtitle: string;
      points: number;
      imageUrl: string;
      brandId: string;
      validFrom: string;
      validTo: string;
    }>) {
      if (this.items.length) return;

      const members: MaskedMember[] = [
        { memberId: "M000132", name: "陳怡君", phone: "0912****68", email: "yijun.chen@example.com" },
        { memberId: "M000517", name: "林冠宇", phone: "0987****21", email: "kuanyu.lin@example.com" },
        { memberId: "M000803", name: "王品妤", phone: "0901****45", email: "pinyu.wang@example.com" },
        { memberId: "M000944", name: "張家豪", phone: "0928****10", email: "jiahao.zhang@example.com" },
        { memberId: "M001105", name: "李心怡", phone: "0966****33", email: "xinyi.li@example.com" },
      ];

      const storeNames = [
        "信義門市",
        "南京門市",
        "忠孝門市",
        "大安門市",
        "桂林門市",
        "台北車站門市",
        "板橋門市",
        "松江門市",
      ];

      const operators = ["系統核銷", "門市店員A", "門市店員B", "客服人員", "後台管理員"];

      const channelPool: RedeemChannel[] = ["store", "online", "pos", "manual"];

      const makeCode = (seed: string): string => {
        const a = seededNumber(seed + "_c1", 1000, 9999);
        const b = seededNumber(seed + "_c2", 1000, 9999);
        const c = seededNumber(seed + "_c3", 10, 99);
        return `TCK-${a}-${b}-${c}`;
      };

      const pick = <T,>(arr: T[], seed: string, salt: string): T => {
        const idx = seededNumber(seed + "_" + salt, 0, Math.max(0, arr.length - 1));
        return arr[idx] as T;
      };

      const pickStatus = (seed: string): RedemptionStatus => {
        const n = seededNumber(seed + "_st", 1, 100);
        if (n <= 25) return "issued";
        if (n <= 80) return "redeemed";
        if (n <= 88) return "expired";
        if (n <= 92) return "void";
        if (n <= 96) return "failed";
        return "refunded";
      };

      const today = new Date();

      const items: AdminRedemption[] = [];
      let seq = 1;

      for (const t of tickets) {
        const count = seededNumber(t.id + "_cnt", 12, 45);

        for (let i = 0; i < count; i++) {
          const seed = `${t.id}_${i}`;

          const daysAgo = seededNumber(seed + "_days", 0, 30);
          const hoursAgo = seededNumber(seed + "_hh", 0, 23);
          const minutesAgo = seededNumber(seed + "_mm", 0, 59);

          const created = new Date(
            today.getTime() - (daysAgo * 24 * 60 + hoursAgo * 60 + minutesAgo) * 60 * 1000
          );

          let status = pickStatus(seed);
          const createdAt = formatDateTime(created);

          const code = makeCode(seed);
          const member = pick(members, seed, "m");
          const storeName = pick(storeNames, seed, "s");
          const operatorName = pick(operators, seed, "op");
          const channel = pick(channelPool, seed, "ch");

          const to = parseYMD(t.validTo);
          const createdD = parseDT(createdAt);
          const expiredByDate =
            !!to && !!createdD && to.getTime() < parseYMD(this.todayYMD)!.getTime();

          if (expiredByDate && status === "issued") {
            status = "expired";
          }

          let redeemedAt: string | null = null;

          if (status === "redeemed") {
            const addDays = seededNumber(seed + "_rd_d", 0, 10);
            const addHours = seededNumber(seed + "_rd_h", 0, 23);
            const addMinutes = seededNumber(seed + "_rd_m", 0, 59);

            const rd = new Date(created.getTime() + (addDays * 24 * 60 + addHours * 60 + addMinutes) * 60 * 1000);

            if (to && rd.getTime() > to.getTime() + 24 * 60 * 60 * 1000 - 1) {
              redeemedAt = formatDateTime(new Date(to.getTime() - 3 * 60 * 60 * 1000));
            } else {
              redeemedAt = formatDateTime(rd);
            }
          }

          if (status === "expired" || status === "void" || status === "refunded" || status === "failed") {
            redeemedAt = null;
          }

          const y = today.getFullYear();
          const m = pad2(today.getMonth() + 1);
          const d = pad2(today.getDate());
          const seqText = String(seq).padStart(6, "0");
          const id = `EX-${y}${m}${d}-${seqText}`;
          seq += 1;

          const note =
            status === "failed"
              ? "核銷失敗：條碼無法辨識（模擬）"
              : status === "void"
                ? "已作廢：使用者取消（模擬）"
                : status === "refunded"
                  ? "已退點：客服處理（模擬）"
                  : "";

          items.push({
            id,
            ticketId: t.id,
            ticketTitle: t.title,
            ticketSubtitle: t.subtitle,
            ticketImageUrl: t.imageUrl,
            brandId: t.brandId,
            points: t.points,
            validFrom: t.validFrom,
            validTo: t.validTo,

            member,

            status,
            channel,

            storeName,
            operatorName,

            code,
            createdAt,
            redeemedAt,

            note,
          });
        }
      }

      // 預設讓新資料「看起來像真的」：依 createdAt desc 排一下
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      this.items = items;
    },

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
      this.filters.ticketId = "";
      this.filters.channel = "";
      this.filters.validState = "";
      this.filters.createdFrom = "";
      this.filters.createdTo = "";
      this.filters.redeemedFrom = "";
      this.filters.redeemedTo = "";
      this.filters.pointsMin = "";
      this.filters.pointsMax = "";
      this.page = 1;
    },

    setQuickStatus(status: "" | RedemptionStatus) {
      this.filters.status = status;
      this.page = 1;
    },

    setPage(p: number) {
      const next = safeClamp(Number(p) || 1, 1, this.pageCount);
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
        "createdAt",
        "redeemedAt",
        "points",
        "status",
        "brand",
        "ticketTitle",
        "validTo",
        "memberName",
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
        this.sort.key = "createdAt";
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

    voidRedemption(id: string) {
      const target = String(id || "");
      if (!target) return;

      const idx = this.items.findIndex((x) => x.id === target);
      if (idx < 0) return;

      const prev = this.items[idx] as AdminRedemption;
      const next: AdminRedemption = {
        ...prev,
        status: "void",
        redeemedAt: null,
        note: prev.note || "已作廢：後台操作（模擬）",
      };
      this.items.splice(idx, 1, next);
    },

    markRedeemed(id: string, operatorName?: string, storeName?: string) {
      const target = String(id || "");
      if (!target) return;

      const idx = this.items.findIndex((x) => x.id === target);
      if (idx < 0) return;

      const prev = this.items[idx] as AdminRedemption;

      // 只有 issued 才允許補登核銷（你可自行放寬）
      if (prev.status !== "issued") return;

      const now = new Date();
      const next: AdminRedemption = {
        ...prev,
        status: "redeemed",
        redeemedAt: formatDateTime(now),
        operatorName: operatorName ? String(operatorName) : prev.operatorName,
        storeName: storeName ? String(storeName) : prev.storeName,
        note: prev.note || "補登核銷：後台操作（模擬）",
      };
      this.items.splice(idx, 1, next);
    },

    refundRedemption(id: string) {
      const target = String(id || "");
      if (!target) return;

      const idx = this.items.findIndex((x) => x.id === target);
      if (idx < 0) return;

      const prev = this.items[idx] as AdminRedemption;

      // 模擬規則：只有 redeemed 才能退點
      if (prev.status !== "redeemed") return;

      const next: AdminRedemption = {
        ...prev,
        status: "refunded",
        redeemedAt: null,
        note: prev.note || "已退點：客服處理（模擬）",
      };
      this.items.splice(idx, 1, next);
    },
  },
});
