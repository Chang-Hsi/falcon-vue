// src/stores/adminSupportTicketStore.ts
import { defineStore } from "pinia";

export type TicketStatus = "new" | "open" | "pending" | "solved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketChannel = "app" | "web" | "email" | "phone" | "line";

export type AgentUser = {
  id: string;
  name: string;
};

export type CustomerInfo = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type TicketTag = "退款" | "付款" | "點數" | "票券" | "核銷" | "帳務" | "系統" | "其他";

export type SupportTicket = {
  id: string;
  subject: string;

  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;

  customer: CustomerInfo;
  assignee: AgentUser | null;

  tags: TicketTag[];

  createdAt: string; // YYYY-MM-DD HH:mm
  updatedAt: string; // YYYY-MM-DD HH:mm
  lastMessageAt: string; // YYYY-MM-DD HH:mm
  lastMessagePreview: string;
  unreadCount: number;

  slaDueAt: string; // YYYY-MM-DD HH:mm
};

export type MessageType = "customer" | "agent" | "internal" | "system";

export type TicketMessage = {
  id: string;
  ticketId: string;
  type: MessageType;
  senderName: string;
  content: string;
  createdAt: string; // YYYY-MM-DD HH:mm
};

type Filters = {
  keyword: string; // subject / ticketId / customer name / email / phone
  status: "" | TicketStatus;
  priority: "" | TicketPriority;
  channel: "" | TicketChannel;
  assigneeId: string;
  unreadOnly: boolean;
};

type SortKey = "lastMessageAt" | "updatedAt" | "createdAt" | "priority" | "status" | "";
type SortDir = "asc" | "desc" | "";

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

function parseYMDHM(text: string) {
  const s = String(text || "").trim();
  if (!s) return null;
  const x = s.replace(/\//g, "-");
  const t = Date.parse(x);
  if (Number.isNaN(t)) return null;
  return new Date(t);
}

function includesCI(a: string, b: string) {
  return String(a || "").toLowerCase().includes(String(b || "").toLowerCase());
}

function seededNumber(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const r = h % 10000;
  const t = r / 9999;
  return Math.floor(min + t * (max - min));
}

function pickOne<T>(arr: T[], idx: number): T {
  const safe = Math.max(0, Math.min(arr.length - 1, idx));
  return arr[safe] as T;
}

function nowPlusMinutes(min: number) {
  return new Date(Date.now() + min * 60 * 1000);
}

function statusOrder(s: TicketStatus) {
  if (s === "new") return 0;
  if (s === "open") return 1;
  if (s === "pending") return 2;
  if (s === "solved") return 3;
  return 4;
}

function priorityOrder(p: TicketPriority) {
  if (p === "urgent") return 0;
  if (p === "high") return 1;
  if (p === "normal") return 2;
  return 3;
}

function safeTrimPreview(s: string, max = 60) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export const useAdminSupportTicketStore = defineStore("adminSupportTicketStore", {
  state: () => {
    const today = new Date();

    const agents: AgentUser[] = [
      { id: "a_zoe", name: "Zoe" },
      { id: "a_ivan", name: "Ivan" },
      { id: "a_mina", name: "Mina" },
      { id: "a_ken", name: "Ken" },
    ];

    const statuses: TicketStatus[] = ["new", "open", "pending", "solved", "closed"];
    const priorities: TicketPriority[] = ["low", "normal", "high", "urgent"];
    const channels: TicketChannel[] = ["app", "web", "email", "phone", "line"];
    const tagsPool: TicketTag[] = ["退款", "付款", "點數", "票券", "核銷", "帳務", "系統", "其他"];

    const customerSeeds = [
      { id: "c_001", name: "王小明", phone: "0912-345-678", email: "ming.wang@example.com" },
      { id: "c_002", name: "陳怡君", phone: "0988-111-222", email: "yijun.chen@example.com" },
      { id: "c_003", name: "林志豪", phone: "0933-222-333", email: "hao.lin@example.com" },
      { id: "c_004", name: "張雅婷", phone: "0966-777-888", email: "yting.chang@example.com" },
      { id: "c_005", name: "黃偉倫", phone: "0900-555-666", email: "weilon.huang@example.com" },
      { id: "c_006", name: "蔡佩珊", phone: "0977-333-444", email: "peishan.tsai@example.com" },
    ];

    function buildTicket(i: number): SupportTicket {
      const id = `T${toYMD(today).replace(/-/g, "")}-${String(i + 1).padStart(4, "0")}`;
      const cust = pickOne(customerSeeds, seededNumber(id + "_cust", 0, customerSeeds.length - 1));

      const status = pickOne(statuses, seededNumber(id + "_st", 0, statuses.length - 1));
      const priority = pickOne(priorities, seededNumber(id + "_pr", 0, priorities.length - 1));
      const channel = pickOne(channels, seededNumber(id + "_ch", 0, channels.length - 1));

      const assigneePick = seededNumber(id + "_as", 0, 100);
      const assignee = assigneePick <= 18 ? null : pickOne(agents, seededNumber(id + "_as2", 0, agents.length - 1));

      const tagCount = seededNumber(id + "_tgN", 1, 3);
      const tags: TicketTag[] = [];
      for (let k = 0; k < tagCount; k++) {
        const t = pickOne(tagsPool, seededNumber(id + "_tg_" + k, 0, tagsPool.length - 1));
        if (!tags.includes(t)) tags.push(t);
      }

      const createdDaysAgo = seededNumber(id + "_cd", 0, 28);
      const created = new Date(today.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000);
      created.setHours(seededNumber(id + "_chh", 9, 19), seededNumber(id + "_cmm", 0, 59), 0, 0);

      const updatedMinutesAgo = seededNumber(id + "_um", 10, 7200);
      const updated = new Date(today.getTime() - updatedMinutesAgo * 60 * 1000);

      const lastMsgMinutesAgo = seededNumber(id + "_lm", 5, 8000);
      const lastMsg = new Date(today.getTime() - lastMsgMinutesAgo * 60 * 1000);

      const unreadCount =
        status === "new" || status === "open"
          ? seededNumber(id + "_un", 0, 6)
          : seededNumber(id + "_un2", 0, 1);

      const slaHours = priority === "urgent" ? 6 : priority === "high" ? 12 : priority === "normal" ? 24 : 48;
      const slaDue = new Date(created.getTime() + slaHours * 60 * 60 * 1000);

      const subjects = [
        "票券核銷失敗，顯示已使用",
        "付款成功但點數沒有入帳",
        "退款進度查詢",
        "無法登入，顯示驗證失敗",
        "對帳金額不一致",
        "訂單狀態卡住在處理中",
        "兌換後沒收到票券",
        "發票資訊需要修改",
      ];
      const subject = pickOne(subjects, seededNumber(id + "_sb", 0, subjects.length - 1));

      const lastPreviewSeeds = [
        "您好，我這張票券在門市核銷一直失敗，請問可以協助嗎？",
        "我付款完成了，但帳戶點數沒有增加。",
        "想確認退款什麼時候會到帳？",
        "剛剛一直登入不進去，會跳出驗證失敗。",
        "我們對帳表上的金額跟實際入帳不一致。",
        "訂單一直顯示處理中，已經超過半小時了。",
        "我兌換成功，但票券列表沒有看到。",
        "發票抬頭需要改成公司名稱。",
      ];
      const lastMessagePreview = safeTrimPreview(
        pickOne(lastPreviewSeeds, seededNumber(id + "_lp", 0, lastPreviewSeeds.length - 1)),
        64
      );

      return {
        id,
        subject,
        status,
        priority,
        channel,
        customer: { ...cust },
        assignee: assignee ? { ...assignee } : null,
        tags,
        createdAt: formatDateTime(created),
        updatedAt: formatDateTime(updated),
        lastMessageAt: formatDateTime(lastMsg),
        lastMessagePreview,
        unreadCount,
        slaDueAt: formatDateTime(slaDue),
      };
    }

    const tickets: SupportTicket[] = [];
    for (let i = 0; i < 72; i++) tickets.push(buildTicket(i));

    const messagesByTicket: Record<string, TicketMessage[]> = {};
    function seedMessages(t: SupportTicket) {
      const base: TicketMessage[] = [];
      const seed = t.id;

      const msgCount = seededNumber(seed + "_mc", 3, 10);
      const lastAt = parseYMDHM(t.lastMessageAt) || new Date();

      for (let i = msgCount - 1; i >= 0; i--) {
        const minutesAgo = seededNumber(seed + "_m" + i, 10, 1800);
        const d = new Date(lastAt.getTime() - minutesAgo * 60 * 1000);

        const typePick = seededNumber(seed + "_mt" + i, 1, 100);
        const type: MessageType =
          typePick <= 55 ? "customer" : typePick <= 86 ? "agent" : typePick <= 94 ? "internal" : "system";

        const senderName =
          type === "customer" ? t.customer.name : type === "agent" ? (t.assignee?.name || "客服") : "系統";

        const customerLines = [
          "我想請問這個狀態正常嗎？",
          "我剛剛在門市掃碼顯示失敗。",
          "可以麻煩幫我查一下嗎？",
          "我有附上截圖，請協助確認。",
          "我現在很急，因為要馬上使用。",
        ];
        const agentLines = [
          "好的，我幫您確認一下，稍等我一下。",
          "我已經收到您的資訊，這邊先協助您排查。",
          "我先幫您更新狀態，若還有問題我再回覆。",
          "請您提供訂單號或交易序號，我才能加速查詢。",
          "我已經幫您補發/補登記，麻煩您再確認一次。",
        ];
        const internalLines = [
          "內部備註：疑似第三方回傳延遲（模擬）。",
          "內部備註：請查 payment provider log（模擬）。",
          "內部備註：先行安撫客戶，等待批次入帳（模擬）。",
        ];
        const systemLines = [
          "系統：工單已建立。",
          "系統：狀態已更新。",
          "系統：已指派客服。",
        ];

        const content =
          type === "customer"
            ? pickOne(customerLines, seededNumber(seed + "_cl" + i, 0, customerLines.length - 1))
            : type === "agent"
            ? pickOne(agentLines, seededNumber(seed + "_al" + i, 0, agentLines.length - 1))
            : type === "internal"
            ? pickOne(internalLines, seededNumber(seed + "_il" + i, 0, internalLines.length - 1))
            : pickOne(systemLines, seededNumber(seed + "_sl" + i, 0, systemLines.length - 1));

        base.push({
          id: `${seed}_m_${String(i + 1).padStart(3, "0")}`,
          ticketId: seed,
          type,
          senderName,
          content,
          createdAt: formatDateTime(d),
        });
      }

      base.sort((a, b) => {
        const da = parseYMDHM(a.createdAt)?.getTime() || 0;
        const db = parseYMDHM(b.createdAt)?.getTime() || 0;
        return da - db;
      });

      messagesByTicket[t.id] = base;
    }

    for (const t of tickets) seedMessages(t);

    return {
      todayYMD: toYMD(today),

      agents,
      tickets,
      messagesByTicket,

      filters: {
        keyword: "",
        status: "",
        priority: "",
        channel: "",
        assigneeId: "",
        unreadOnly: false,
      } as Filters,

      sort: {
        key: "lastMessageAt" as SortKey,
        dir: "desc" as SortDir,
      },

      page: 1,
      pageSize: 12,

      activeTicketId: "" as string,
    };
  },

  getters: {
    isOverdue(state) {
      return (t: SupportTicket) => {
        const due = parseYMDHM(t.slaDueAt);
        if (!due) return false;
        const now = new Date();
        const closedLike = t.status === "solved" || t.status === "closed";
        if (closedLike) return false;
        return due.getTime() < now.getTime();
      };
    },

    filteredTickets(state): SupportTicket[] {
      const f = state.filters;

      const kw = String(f.keyword || "").trim();
      const status = f.status;
      const priority = f.priority;
      const channel = f.channel;
      const assigneeId = String(f.assigneeId || "").trim();
      const unreadOnly = !!f.unreadOnly;

      let arr = state.tickets.slice();

      if (kw) {
        arr = arr.filter((x) => {
          const inCustomer =
            includesCI(x.customer.name, kw) || includesCI(x.customer.email, kw) || includesCI(x.customer.phone, kw);
          return includesCI(x.subject, kw) || includesCI(x.id, kw) || inCustomer;
        });
      }

      if (status) arr = arr.filter((x) => x.status === status);
      if (priority) arr = arr.filter((x) => x.priority === priority);
      if (channel) arr = arr.filter((x) => x.channel === channel);

      if (assigneeId) {
        arr = arr.filter((x) => (x.assignee?.id || "") === assigneeId);
      }

      if (unreadOnly) {
        arr = arr.filter((x) => Number(x.unreadCount) > 0);
      }

      const key = state.sort.key;
      const dir = state.sort.dir;

      if (key && dir) {
        const factor = dir === "asc" ? 1 : -1;

        arr.sort((a, b) => {
          let va: string | number = "";
          let vb: string | number = "";

          if (key === "lastMessageAt") {
            va = parseYMDHM(a.lastMessageAt)?.getTime() || 0;
            vb = parseYMDHM(b.lastMessageAt)?.getTime() || 0;
          } else if (key === "updatedAt") {
            va = parseYMDHM(a.updatedAt)?.getTime() || 0;
            vb = parseYMDHM(b.updatedAt)?.getTime() || 0;
          } else if (key === "createdAt") {
            va = parseYMDHM(a.createdAt)?.getTime() || 0;
            vb = parseYMDHM(b.createdAt)?.getTime() || 0;
          } else if (key === "priority") {
            va = priorityOrder(a.priority);
            vb = priorityOrder(b.priority);
          } else if (key === "status") {
            va = statusOrder(a.status);
            vb = statusOrder(b.status);
          }

          return (Number(va) - Number(vb)) * factor;
        });
      }

      return arr;
    },

    total(): number {
      return this.filteredTickets.length;
    },

    pageCount(state): number {
      const total = this.filteredTickets.length;
      const size = Math.max(1, Number(state.pageSize) || 10);
      return Math.max(1, Math.ceil(total / size));
    },

    pageTickets(state): SupportTicket[] {
      const p = Math.min(Math.max(1, Number(state.page) || 1), this.pageCount);
      const size = Math.max(1, Number(state.pageSize) || 10);
      const start = (p - 1) * size;
      const end = start + size;
      return this.filteredTickets.slice(start, end);
    },

    getTicketById(state) {
      return (id: string) => {
        const target = String(id || "");
        return state.tickets.find((x) => x.id === target) || null;
      };
    },

    getMessagesByTicket(state) {
      return (ticketId: string) => {
        const tid = String(ticketId || "");
        return state.messagesByTicket[tid] ? state.messagesByTicket[tid].slice() : [];
      };
    },

    activeTicket(state) {
      const id = String(state.activeTicketId || "");
      if (!id) return null;
      return state.tickets.find((x) => x.id === id) || null;
    },

    activeMessages(): TicketMessage[] {
      const t = this.activeTicket;
      if (!t) return [];
      return this.getMessagesByTicket(t.id);
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
      this.filters.priority = "";
      this.filters.channel = "";
      this.filters.assigneeId = "";
      this.filters.unreadOnly = false;
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

    toggleSort(key: SortKey) {
      const allowed: SortKey[] = ["lastMessageAt", "updatedAt", "createdAt", "priority", "status", ""];
      if (!allowed.includes(key)) return;

      if (this.sort.key !== key) {
        this.sort.key = key;
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
        this.sort.key = "lastMessageAt";
        this.sort.dir = "desc";
        this.page = 1;
        return;
      }

      this.sort.dir = "asc";
      this.page = 1;
    },

    setActiveTicket(id: string) {
      const target = String(id || "");
      this.activeTicketId = target;

      const idx = this.tickets.findIndex((x) => x.id === target);
      if (idx >= 0) {
        const prev = this.tickets[idx];
        if (prev && prev.unreadCount > 0) {
          this.tickets.splice(idx, 1, { ...prev, unreadCount: 0, updatedAt: formatDateTime(new Date()) });
        }
      }
    },

    updateTicket(payload: Partial<SupportTicket> & { id: string }) {
      const id = String(payload.id || "");
      if (!id) return;

      const idx = this.tickets.findIndex((x) => x.id === id);
      if (idx < 0) return;

      const prev = this.tickets[idx];
      if (!prev) return;

      const next: SupportTicket = {
        ...prev,
        ...payload,
        customer: payload.customer ? { ...prev.customer, ...payload.customer } : prev.customer,
        assignee: payload.assignee === null ? null : payload.assignee ? { ...payload.assignee } : prev.assignee,
        tags: Array.isArray(payload.tags) ? payload.tags.slice() : prev.tags,
        updatedAt: payload.updatedAt || formatDateTime(new Date()),
      };

      this.tickets.splice(idx, 1, next);
    },

    addAgentReply(ticketId: string, content: string, senderName = "客服") {
      const tid = String(ticketId || "");
      const text = String(content || "").trim();
      if (!tid || !text) return;

      const d = new Date();
      const msg: TicketMessage = {
        id: `${tid}_m_${String(Date.now())}`,
        ticketId: tid,
        type: "agent",
        senderName,
        content: text,
        createdAt: formatDateTime(d),
      };

      if (!this.messagesByTicket[tid]) this.messagesByTicket[tid] = [];
      this.messagesByTicket[tid].push(msg);

      const idx = this.tickets.findIndex((x) => x.id === tid);
      if (idx >= 0) {
        const prev = this.tickets[idx];
        if (prev) {
          const next: SupportTicket = {
            ...prev,
            lastMessageAt: formatDateTime(d),
            lastMessagePreview: safeTrimPreview(text, 64),
            updatedAt: formatDateTime(d),
            unreadCount: 0,
          };
          this.tickets.splice(idx, 1, next);
        }
      }
    },

    addInternalNote(ticketId: string, content: string, senderName = "客服") {
      const tid = String(ticketId || "");
      const text = String(content || "").trim();
      if (!tid || !text) return;

      const d = new Date();
      const msg: TicketMessage = {
        id: `${tid}_m_${String(Date.now())}`,
        ticketId: tid,
        type: "internal",
        senderName,
        content: text,
        createdAt: formatDateTime(d),
      };

      if (!this.messagesByTicket[tid]) this.messagesByTicket[tid] = [];
      this.messagesByTicket[tid].push(msg);

      const idx = this.tickets.findIndex((x) => x.id === tid);
      if (idx >= 0) {
        const prev = this.tickets[idx];
        if (prev) {
          const next: SupportTicket = {
            ...prev,
            updatedAt: formatDateTime(d),
            unreadCount: 0,
          };
          this.tickets.splice(idx, 1, next);
        }
      }
    },

    addSystemMessage(ticketId: string, content: string) {
      const tid = String(ticketId || "");
      const text = String(content || "").trim();
      if (!tid || !text) return;

      const d = new Date();
      const msg: TicketMessage = {
        id: `${tid}_m_${String(Date.now())}`,
        ticketId: tid,
        type: "system",
        senderName: "系統",
        content: text,
        createdAt: formatDateTime(d),
      };

      if (!this.messagesByTicket[tid]) this.messagesByTicket[tid] = [];
      this.messagesByTicket[tid].push(msg);

      const idx = this.tickets.findIndex((x) => x.id === tid);
      if (idx >= 0) {
        const prev = this.tickets[idx];
        if (prev) {
          const next: SupportTicket = {
            ...prev,
            updatedAt: formatDateTime(d),
          };
          this.tickets.splice(idx, 1, next);
        }
      }
    },

    ensureSlaIfMissing(ticketId: string) {
      const tid = String(ticketId || "");
      if (!tid) return;

      const t = this.getTicketById(tid);
      if (!t) return;

      const due = parseYMDHM(t.slaDueAt);
      if (due) return;

      const created = parseYMDHM(t.createdAt) || nowPlusMinutes(-60);
      const hours = t.priority === "urgent" ? 6 : t.priority === "high" ? 12 : t.priority === "normal" ? 24 : 48;
      const nextDue = new Date(created.getTime() + hours * 60 * 60 * 1000);

      this.updateTicket({ id: tid, slaDueAt: formatDateTime(nextDue) });
    },
  },
});
