// src/stores/adminMemberStore.ts
import { defineStore } from "pinia";

export type MemberStatus = "enabled" | "disabled" | "blocked";
export type MemberLevel = "normal" | "vip" | "business";

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  joinedAt: string; // YYYY-MM-DD
  lastLoginAt: string; // YYYY-MM-DD HH:mm
  status: MemberStatus;
  level: MemberLevel;
  tags: string[];
  avatarUrl: string;
  internalNote?: string;
};

export type MemberFilters = {
  keyword: string;
  status: "" | MemberStatus;
  level: "" | MemberLevel;
  tag: string;
  joinedFrom: string;
  joinedTo: string;
};

export type MemberSortField = "joinedAt" | "lastLoginAt" | "name";
export type SortDir = "asc" | "desc";

export type MemberSort = {
  field: MemberSortField;
  dir: SortDir;
};

export type MemberLog = {
  id: string;
  memberId: string;
  createdAt: string; // YYYY-MM-DD HH:mm
  actor: string; // 後台操作者
  action: string; // 例如：更新資料 / 變更狀態
  detail: string; // 例如：status enabled -> disabled（原因：...）
};

type State = {
  members: Member[];
  filters: MemberFilters;
  sort: MemberSort;
  page: number;
  pageSize: number;
  selectedIds: string[];
  logs: Record<string, MemberLog[]>;
  actorName: string;
  presetTags: string[];
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function nowText() {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toDateText(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function compareText(a: string, b: string) {
  return String(a || "").localeCompare(String(b || ""));
}

function normalizeKw(s: string) {
  return String(s || "").trim().toLowerCase();
}

function includesLoose(haystack: string, needle: string) {
  return normalizeKw(haystack).includes(normalizeKw(needle));
}

function inDateRange(dateText: string, from: string, to: string) {
  const d = String(dateText || "");
  if (!d) return false;
  const f = String(from || "");
  const t = String(to || "");
  if (f && d < f) return false;
  if (t && d > t) return false;
  return true;
}

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * 你要「每筆資料都有固定頭像網址」→ 在這裡塞網址清單
 * 不夠 68 張也沒關係：會循環分配
 */
const avatarPool = [
  "https://i.pinimg.com/736x/c6/6e/c8/c66ec845e1354298fa339fe6d194e65b.jpg",
  "https://i.pinimg.com/736x/05/57/5d/05575d63e8eddbc332b63864b8f2f4b4.jpg",
  "https://i.pinimg.com/736x/fc/af/7a/fcaf7aec4b7be05a0d062eff7851d2aa.jpg",
  "https://i.pinimg.com/736x/eb/76/a4/eb76a46ab920d056b02d203ca95e9a22.jpg",
  "https://i.pinimg.com/736x/ee/94/8f/ee948f674631ebcfa423c63fa2608925.jpg",
  "https://i.pinimg.com/736x/45/90/08/4590086db4b2d79ee9827a78e8f70d69.jpg",
  "https://i.pinimg.com/736x/c8/aa/b6/c8aab611fd51915e1d4ce855ab442e0c.jpg",
  "https://i.pinimg.com/736x/3c/08/4c/3c084cdc36c4137124a2e36c41df2849.jpg",
  "https://i.pinimg.com/736x/8c/d5/38/8cd538a99d153843f07cb8dfcc11648d.jpg",
  "https://i.pinimg.com/1200x/f7/a0/c4/f7a0c48a7c25f49d8df32804a49100ec.jpg",
  "https://i.pinimg.com/1200x/73/98/63/739863de1261bff3402189bc36e23418.jpg",
  "https://i.pinimg.com/736x/5c/3d/38/5c3d38f43a5c6fab6b7b2b69905a7ffa.jpg",
  "https://i.pinimg.com/736x/be/fb/69/befb69f08d9a1972c2773ede3c13fdde.jpg",
  "https://i.pinimg.com/736x/c8/b6/a8/c8b6a84abc3b7bd5ce01c6d00384e44e.jpg",
  "https://i.pinimg.com/736x/ed/7f/ab/ed7faba4a56526e317b2e976fdc5b138.jpg",
] as const;

function avatarByIndex(idx: number) {
  const pool = avatarPool as readonly string[];
  if (pool.length <= 0) return "";
  const i = Math.abs(Number(idx) || 0) % pool.length;

  // noUncheckedIndexedAccess 下，pool[i] 可能是 string | undefined
  const url = pool[i];
  return typeof url === "string" ? url : "";
}

function makeMockMembers(): Member[] {
  const lastNames = [
    "陳",
    "林",
    "黃",
    "張",
    "李",
    "王",
    "吳",
    "劉",
    "蔡",
    "楊",
    "許",
    "鄭",
    "謝",
    "洪",
  ] as const;

  const firstNames = [
    "志明",
    "怡君",
    "建宏",
    "雅婷",
    "冠宇",
    "佳穎",
    "柏翰",
    "欣怡",
    "子晴",
    "家豪",
    "郁庭",
    "俊傑",
    "品妤",
    "承翰",
    "映彤",
    "宇軒",
    "思妤",
    "沛慈",
  ] as const;

  const cities = [
    "臺北市大安區",
    "新北市板橋區",
    "桃園市中壢區",
    "臺中市西屯區",
    "臺南市東區",
    "高雄市左營區",
    "新竹市東區",
    "基隆市仁愛區",
    "宜蘭縣羅東鎮",
    "彰化縣員林市",
  ] as const;

  const streets = [
    "中山路",
    "中正路",
    "民生路",
    "復興路",
    "和平路",
    "忠孝東路",
    "光復路",
    "仁愛路",
    "三民路",
    "成功路",
  ] as const;

  const tagsPool = [
    "VIP",
    "高風險",
    "常客",
    "退款關注",
    "票券用戶",
    "企業用戶",
    "黑名單",
    "需回電",
    "已驗證",
    "未驗證",
  ] as const;

  const levelPool: readonly MemberLevel[] = ["normal", "vip", "business"] as const;
  const statusPool: readonly MemberStatus[] = [
    "enabled",
    "enabled",
    "enabled",
    "disabled",
    "blocked",
  ] as const;

  const today = new Date();
  const members: Member[] = [];

  for (let i = 1; i <= 68; i++) {
    const ln = pick(lastNames);
    const fn = pick(firstNames);
    const name = `${ln}${fn}`;

    const id = `MBR${String(i).padStart(5, "0")}`;
    const email = `${id.toLowerCase()}@example.com`;

    const phone = `09${String(randInt(10, 99)).padStart(2, "0")}-${String(
      randInt(0, 999)
    ).padStart(3, "0")}-${String(randInt(0, 999)).padStart(3, "0")}`;

    const addr = `${pick(cities)}${pick(streets)}${randInt(1, 399)}號${randInt(
      1,
      30
    )}樓`;

    const joined = addDays(today, -randInt(30, 2500));
    const lastLogin = addDays(today, -randInt(0, 60));
    const joinedAt = toDateText(joined);
    const lastLoginAt = `${toDateText(lastLogin)} ${pad2(randInt(8, 23))}:${pad2(
      randInt(0, 59)
    )}`;

    const level = pick(levelPool);
    const status = pick(statusPool);

    const tagsCount = randInt(0, 3);
    const tags = Array.from({ length: tagsCount }, () => pick(tagsPool));
    const dedupTags = Array.from(new Set(tags)) as string[];

    // ✅ 這裡就是「每筆資料都直接塞固定圖片網址」
    const avatarUrl = avatarByIndex(i - 1);

    members.push({
      id,
      name,
      email,
      phone,
      billingAddress: addr,
      joinedAt,
      lastLoginAt,
      status,
      level,
      tags: dedupTags,
      avatarUrl,
      internalNote: "",
    });
  }

  return members.sort((a, b) => (a.joinedAt < b.joinedAt ? 1 : -1));
}

export const useAdminMemberStore = defineStore("adminMemberStore", {
  state: (): State => {
    const members = makeMockMembers();
    const logs: Record<string, MemberLog[]> = {};

    for (const m of members.slice(0, 12)) {
      logs[m.id] = [
        {
          id: makeId("log"),
          memberId: m.id,
          createdAt: nowText(),
          actor: "系統",
          action: "建立會員",
          detail: `會員由前台註冊建立（level=${m.level}）`,
        },
      ];
    }

    return {
      members,
      filters: {
        keyword: "",
        status: "",
        level: "",
        tag: "",
        joinedFrom: "",
        joinedTo: "",
      },
      sort: {
        field: "joinedAt",
        dir: "desc",
      },
      page: 1,
      pageSize: 12,
      selectedIds: [],
      logs,
      actorName: "後台管理員",
      presetTags: [
        "VIP",
        "高風險",
        "常客",
        "退款關注",
        "票券用戶",
        "企業用戶",
        "黑名單",
        "需回電",
        "已驗證",
        "未驗證",
      ],
    };
  },

  getters: {
    filteredMembers(state): Member[] {
      const kw = normalizeKw(state.filters.keyword);
      const status = state.filters.status;
      const level = state.filters.level;
      const tag = String(state.filters.tag || "").trim();
      const from = String(state.filters.joinedFrom || "").trim();
      const to = String(state.filters.joinedTo || "").trim();

      let list = state.members.slice();

      if (status) list = list.filter((m) => m.status === status);
      if (level) list = list.filter((m) => m.level === level);
      if (tag) list = list.filter((m) => (m.tags || []).includes(tag));
      if (from || to) list = list.filter((m) => inDateRange(m.joinedAt, from, to));

      if (kw) {
        list = list.filter((m) => {
          return (
            includesLoose(m.id, kw) ||
            includesLoose(m.name, kw) ||
            includesLoose(m.email, kw) ||
            includesLoose(m.phone, kw)
          );
        });
      }

      const field = state.sort.field;
      const dir = state.sort.dir;
      const mul = dir === "asc" ? 1 : -1;

      list.sort((a, b) => {
        if (field === "name") return mul * compareText(a.name, b.name);
        if (field === "joinedAt") return mul * compareText(a.joinedAt, b.joinedAt);
        return mul * compareText(a.lastLoginAt, b.lastLoginAt);
      });

      return list;
    },

    total(): number {
      return this.filteredMembers.length;
    },

    pageCount(state): number {
      const size = Number(state.pageSize) || 12;
      return Math.max(1, Math.ceil(this.total / size));
    },

    pageMembers(state): Member[] {
      const size = Number(state.pageSize) || 12;
      const p = Math.min(Math.max(1, Number(state.page) || 1), this.pageCount);
      const start = (p - 1) * size;
      return this.filteredMembers.slice(start, start + size);
    },

    isSelected(state) {
      return (id: string) => {
        const mid = String(id || "");
        return (state.selectedIds || []).includes(mid);
      };
    },

    selectedCount(state): number {
      return (state.selectedIds || []).length;
    },

    selectedMembers(state): Member[] {
      const set = new Set(state.selectedIds || []);
      return state.members.filter((m) => set.has(m.id));
    },

    getMemberById(state) {
      return (id: string): Member | null => {
        const mid = String(id || "");
        if (!mid) return null;
        return state.members.find((m) => m.id === mid) || null;
      };
    },

    getLogsByMember(state) {
      return (id: string): MemberLog[] => {
        const mid = String(id || "");
        const base = state.logs[mid] || [];
        return base.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      };
    },

    allTags(state): string[] {
      const set = new Set<string>(state.presetTags || []);
      for (const m of state.members) {
        for (const t of m.tags || []) set.add(String(t));
      }
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    },
  },

  actions: {
    setFilters(next: Partial<MemberFilters>) {
      this.filters = { ...this.filters, ...next };
    },

    resetFilters() {
      this.filters = {
        keyword: "",
        status: "",
        level: "",
        tag: "",
        joinedFrom: "",
        joinedTo: "",
      };
      this.page = 1;
      this.selectedIds = [];
    },

    applyFilters() {
      this.page = 1;
      this.selectedIds = [];
    },

    setSort(field: MemberSortField, dir: SortDir) {
      this.sort = { field, dir };
      this.page = 1;
    },

    setPage(p: number) {
      const next = Math.min(Math.max(1, Number(p) || 1), this.pageCount);
      this.page = next;
    },

    setPageSize(size: number) {
      const v = Number(size) || 12;
      this.pageSize = v;
      this.page = 1;
      this.selectedIds = [];
    },

    toggleSelect(id: string) {
      const mid = String(id || "");
      if (!mid) return;

      const set = new Set(this.selectedIds || []);
      if (set.has(mid)) set.delete(mid);
      else set.add(mid);
      this.selectedIds = Array.from(set);
    },

    clearSelection() {
      this.selectedIds = [];
    },

    selectAllOnPage() {
      const set = new Set(this.selectedIds || []);
      for (const m of this.pageMembers) set.add(m.id);
      this.selectedIds = Array.from(set);
    },

    unselectAllOnPage() {
      const pageSet = new Set(this.pageMembers.map((m) => m.id));
      const set = new Set(this.selectedIds || []);
      for (const id of pageSet) set.delete(id);
      this.selectedIds = Array.from(set);
    },

    addLog(memberId: string, action: string, detail: string, actor?: string) {
      const mid = String(memberId || "");
      if (!mid) return;

      const log: MemberLog = {
        id: makeId("log"),
        memberId: mid,
        createdAt: nowText(),
        actor: actor || this.actorName || "後台",
        action,
        detail,
      };

      const base = this.logs[mid] || [];
      this.logs = { ...this.logs, [mid]: [log, ...base].slice(0, 200) };
    },

    updateMember(payload: Partial<Member> & { id: string }) {
      const id = String(payload.id || "");
      if (!id) return;

      const idx = this.members.findIndex((m) => m.id === id);
      if (idx < 0) return;

      const before = this.members[idx];
      if (!before) return;

      const next: Member = {
        ...before,
        ...payload,
        tags: Array.isArray(payload.tags) ? payload.tags : before.tags,
      };

      const members = this.members.slice();
      members[idx] = next;
      this.members = members;
    },

    bulkSetStatus(status: MemberStatus, reason: string) {
      const ids = (this.selectedIds || []).slice();
      if (!ids.length) return;

      for (const id of ids) {
        const m = this.getMemberById(id);
        if (!m) continue;
        if (m.status === status) continue;

        const before = m.status;
        this.updateMember({ id, status });
        this.addLog(
          id,
          "變更狀態",
          `status ${before} -> ${status}${reason ? `（原因：${reason}）` : ""}`
        );
      }

      this.clearSelection();
    },

    bulkAddTag(tag: string) {
      const t = String(tag || "").trim();
      if (!t) return;

      const ids = (this.selectedIds || []).slice();
      if (!ids.length) return;

      for (const id of ids) {
        const m = this.getMemberById(id);
        if (!m) continue;

        const set = new Set<string>(m.tags || []);
        if (set.has(t)) continue;

        set.add(t);
        this.updateMember({ id, tags: Array.from(set) });
        this.addLog(id, "新增標籤", `新增標籤：${t}`);
      }

      this.clearSelection();
    },

    bulkRemoveTag(tag: string) {
      const t = String(tag || "").trim();
      if (!t) return;

      const ids = (this.selectedIds || []).slice();
      if (!ids.length) return;

      for (const id of ids) {
        const m = this.getMemberById(id);
        if (!m) continue;

        const set = new Set<string>(m.tags || []);
        if (!set.has(t)) continue;

        set.delete(t);
        this.updateMember({ id, tags: Array.from(set) });
        this.addLog(id, "移除標籤", `移除標籤：${t}`);
      }

      this.clearSelection();
    },

    exportCsv(ids?: string[]) {
      const pickIds = Array.isArray(ids) && ids.length ? ids : this.selectedIds || [];
      const list: Member[] =
        pickIds.length > 0
          ? pickIds
              .map((id) => this.getMemberById(id))
              .filter((x): x is Member => x !== null)
          : this.filteredMembers;

      const header = [
        "id",
        "name",
        "email",
        "phone",
        "status",
        "level",
        "joinedAt",
        "lastLoginAt",
        "tags",
        "billingAddress",
        "avatarUrl",
      ];

      const rows = list.map((m) => {
        const cols = [
          m.id,
          m.name,
          m.email,
          m.phone,
          m.status,
          m.level,
          m.joinedAt,
          m.lastLoginAt,
          (m.tags || []).join("|"),
          m.billingAddress,
          m.avatarUrl,
        ];
        return cols.map(csvEscape).join(",");
      });

      return [header.join(","), ...rows].join("\n");
    },

    setFromQuery(query: Record<string, unknown>) {
      const q = query || {};

      const kw = String((q as Record<string, unknown>).kw ?? "");
      const statusRaw = String((q as Record<string, unknown>).status ?? "");
      const levelRaw = String((q as Record<string, unknown>).level ?? "");
      const tag = String((q as Record<string, unknown>).tag ?? "");
      const from = String((q as Record<string, unknown>).from ?? "");
      const to = String((q as Record<string, unknown>).to ?? "");
      const page = Number((q as Record<string, unknown>).page ?? 1);
      const size = Number((q as Record<string, unknown>).size ?? this.pageSize);
      const sf = String((q as Record<string, unknown>).sf ?? this.sort.field);
      const sd = String((q as Record<string, unknown>).sd ?? this.sort.dir);

      const status: "" | MemberStatus =
        statusRaw === "enabled" || statusRaw === "disabled" || statusRaw === "blocked"
          ? (statusRaw as MemberStatus)
          : "";

      const level: "" | MemberLevel =
        levelRaw === "normal" || levelRaw === "vip" || levelRaw === "business"
          ? (levelRaw as MemberLevel)
          : "";

      const fieldOk = sf === "joinedAt" || sf === "lastLoginAt" || sf === "name";
      const dirOk = sd === "asc" || sd === "desc";

      this.filters = {
        keyword: kw,
        status,
        level,
        tag,
        joinedFrom: from,
        joinedTo: to,
      };

      this.sort = {
        field: fieldOk ? (sf as MemberSortField) : "joinedAt",
        dir: dirOk ? (sd as SortDir) : "desc",
      };

      this.pageSize = [12, 24, 48].includes(size) ? size : this.pageSize;
      this.page = Math.min(Math.max(1, page || 1), this.pageCount);
      this.selectedIds = [];
    },

    toQueryObject() {
      const q: Record<string, string> = {};

      if (this.filters.keyword) q.kw = this.filters.keyword;
      if (this.filters.status) q.status = this.filters.status;
      if (this.filters.level) q.level = this.filters.level;
      if (this.filters.tag) q.tag = this.filters.tag;
      if (this.filters.joinedFrom) q.from = this.filters.joinedFrom;
      if (this.filters.joinedTo) q.to = this.filters.joinedTo;

      if (this.page !== 1) q.page = String(this.page);
      if (this.pageSize !== 12) q.size = String(this.pageSize);

      if (this.sort.field !== "joinedAt") q.sf = this.sort.field;
      if (this.sort.dir !== "desc") q.sd = this.sort.dir;

      return q;
    },
  },
});
