// src/stores/adminReconcileStore.ts
import { defineStore } from "pinia";

export type ReconcileStatus = "pending" | "settled" | "refunded" | "void" | "failed";

export type PaymentMethodId =
  | "credit_card"
  | "line_pay"
  | "apple_pay"
  | "bank_transfer"
  | "cash"
  | "other";

export type BrandOption = { id: string; label: string };
export type PaymentOption = { id: PaymentMethodId; label: string };

export type ReconcileRow = {
  id: string;
  date: string; // YYYY-MM-DD
  orderNo: string;
  txNo: string;

  brandId: string;
  paymentMethod: PaymentMethodId;

  amount: number; // 交易金額
  fee: number; // 手續費
  net: number; // 淨入帳

  status: ReconcileStatus;

  settledAt: string; // YYYY-MM-DD HH:mm or ""
  note: string;
};

type SortDir = "asc" | "desc" | "";
export type SortKey = "date" | "amount" | "fee" | "net" | "status" | "brand" | "payment" | "orderNo" | "";

type Filters = {
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  brandId: string;
  paymentMethod: "" | PaymentMethodId;
  status: "" | ReconcileStatus;
  keyword: string; // orderNo / txNo / id
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${y}-${m}-${dd}`;
}

function formatDateTime(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${y}-${m}-${dd} ${hh}:${mm}`;
}

function parseYMD(ymd: string) {
  const s = String(ymd || "").trim();
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

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function money(n: number) {
  const v = Number(n) || 0;
  return Math.round(v);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(val: string) {
  const s = String(val ?? "");
  const needsQuote = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

function toCsv(rows: Record<string, string | number>[], headers: { key: string; label: string }[]) {
  const head = headers.map((h) => escapeCsvCell(h.label)).join(",");
  const lines = rows.map((r) => headers.map((h) => escapeCsvCell(String(r[h.key] ?? ""))).join(","));
  return [head, ...lines].join("\n");
}

function toXlsHtml(
  rows: Record<string, string | number>[],
  headers: { key: string; label: string }[],
  title: string
) {
  const ths = headers.map((h) => `<th>${String(h.label)}</th>`).join("");
  const trs = rows
    .map((r) => {
      const tds = headers.map((h) => `<td>${String(r[h.key] ?? "")}</td>`).join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");

  const safeTitle = String(title || "Report").replace(/[<>]/g, "");
  return `
<html>
<head>
<meta charset="utf-8" />
<title>${safeTitle}</title>
<style>
  table { border-collapse: collapse; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 10px; font-size: 12px; }
  th { background: #f8fafc; text-align: left; }
</style>
</head>
<body>
<table>
  <thead><tr>${ths}</tr></thead>
  <tbody>${trs}</tbody>
</table>
</body>
</html>
`.trim();
}

export const useAdminReconcileStore = defineStore("adminReconcileStore", {
  state: () => {
    const brands: BrandOption[] = [
      { id: "subway", label: "Subway" },
      { id: "starbucks", label: "星巴克" },
      { id: "showtime", label: "威秀影城" },
      { id: "cosmed", label: "康是美" },
      { id: "spa", label: "SPA會館" },
      { id: "carrefour", label: "家樂福" },
    ];

    const payments: PaymentOption[] = [
      { id: "credit_card", label: "信用卡" },
      { id: "line_pay", label: "LINE Pay" },
      { id: "apple_pay", label: "Apple Pay" },
      { id: "bank_transfer", label: "銀行轉帳" },
      { id: "cash", label: "現金" },
      { id: "other", label: "其他" },
    ];

    const today = new Date();
    const todayYMD = toYMD(today);

    const dateTo = todayYMD;
    const dateFrom = toYMD(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));

    function pickBrand(seed: string) {
      const idx = seededNumber(seed + "_brand", 0, brands.length - 1);
      return brands[clamp(idx, 0, brands.length - 1)]?.id || brands[0]?.id || "";
    }

    function pickPayment(seed: string): PaymentMethodId {
      const idx = seededNumber(seed + "_pay", 0, payments.length - 1);
      const v = payments[clamp(idx, 0, payments.length - 1)]?.id || "credit_card";
      return v;
    }

    function pickStatus(seed: string): ReconcileStatus {
      const n = seededNumber(seed + "_st", 1, 100);
      if (n <= 48) return "settled";
      if (n <= 72) return "pending";
      if (n <= 82) return "refunded";
      if (n <= 92) return "void";
      return "failed";
    }

    function buildRow(i: number): ReconcileRow {
      const id = `rec_${String(i + 1).padStart(4, "0")}`;
      const daysAgo = seededNumber(id + "_d", 0, 55);
      const d = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const date = toYMD(d);

      const orderNo = `OD${date.replace(/-/g, "")}${String(seededNumber(id + "_o", 1000, 9999))}`;
      const txNo = `TX${String(seededNumber(id + "_t", 100000, 999999))}${pad2(seededNumber(id + "_t2", 0, 99))}`;

      const brandId = pickBrand(id);
      const paymentMethod = pickPayment(id);
      const status = pickStatus(id);

      const amount = money(seededNumber(id + "_amt", 80, 2580));
      const feeRateBp = seededNumber(id + "_fee", 5, 35);
      const fee = money(Math.max(0, Math.round((amount * feeRateBp) / 1000)));
      const net = money(Math.max(0, amount - fee));

      let settledAt = "";
      if (status === "settled" || status === "refunded") {
        const hh = seededNumber(id + "_hh", 9, 20);
        const mm = seededNumber(id + "_mm", 0, 59);
        const sd = new Date(d.getTime());
        sd.setHours(hh, mm, 0, 0);
        settledAt = formatDateTime(sd);
      }

      const note =
        status === "failed"
          ? "第三方回傳失敗（模擬）"
          : status === "void"
          ? "作廢（模擬）"
          : status === "refunded"
          ? "已退款（模擬）"
          : "";

      return {
        id,
        date,
        orderNo,
        txNo,
        brandId,
        paymentMethod,
        amount,
        fee,
        net,
        status,
        settledAt,
        note,
      };
    }

    const items: ReconcileRow[] = [];
    for (let i = 0; i < 86; i++) items.push(buildRow(i));

    return {
      todayYMD,
      brands,
      payments,
      items,

      filters: {
        dateFrom,
        dateTo,
        brandId: "",
        paymentMethod: "",
        status: "",
        keyword: "",
      } as Filters,

      sort: {
        key: "date" as SortKey,
        dir: "desc" as SortDir,
      },

      page: 1,
      pageSize: 10,
    };
  },

  getters: {
    brandLabelMap(state): Record<string, string> {
      const map: Record<string, string> = {};
      for (const b of state.brands) map[b.id] = b.label;
      return map;
    },

    paymentLabelMap(state): Record<string, string> {
      const map: Record<string, string> = {};
      for (const p of state.payments) map[p.id] = p.label;
      return map;
    },

    filteredItems(state): ReconcileRow[] {
      const f = state.filters;

      const kw = String(f.keyword || "").trim();
      const brandId = String(f.brandId || "").trim();
      const paymentMethod = f.paymentMethod;
      const status = f.status;

      const from = parseYMD(f.dateFrom);
      const to = parseYMD(f.dateTo);

      let arr = state.items.slice();

      if (from || to) {
        arr = arr.filter((x) => {
          const d = parseYMD(x.date);
          if (!d) return false;
          if (from && d.getTime() < from.getTime()) return false;
          if (to && d.getTime() > to.getTime()) return false;
          return true;
        });
      }

      if (kw) {
        arr = arr.filter(
          (x) =>
            includesCI(x.orderNo, kw) ||
            includesCI(x.txNo, kw) ||
            includesCI(x.id, kw)
        );
      }

      if (brandId) arr = arr.filter((x) => x.brandId === brandId);
      if (paymentMethod) arr = arr.filter((x) => x.paymentMethod === paymentMethod);
      if (status) arr = arr.filter((x) => x.status === status);

      const key = state.sort.key;
      const dir = state.sort.dir;

      if (key && dir) {
        const factor = dir === "asc" ? 1 : -1;

        arr.sort((a, b) => {
          let va: string | number = "";
          let vb: string | number = "";

          if (key === "date") {
            va = a.date;
            vb = b.date;
          } else if (key === "amount") {
            va = a.amount;
            vb = b.amount;
          } else if (key === "fee") {
            va = a.fee;
            vb = b.fee;
          } else if (key === "net") {
            va = a.net;
            vb = b.net;
          } else if (key === "status") {
            va = a.status;
            vb = b.status;
          } else if (key === "brand") {
            va = this.brandLabelMap[a.brandId] || a.brandId;
            vb = this.brandLabelMap[b.brandId] || b.brandId;
          } else if (key === "payment") {
            va = this.paymentLabelMap[a.paymentMethod] || a.paymentMethod;
            vb = this.paymentLabelMap[b.paymentMethod] || b.paymentMethod;
          } else if (key === "orderNo") {
            va = a.orderNo;
            vb = b.orderNo;
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

    pageItems(state): ReconcileRow[] {
      const p = clamp(Number(state.page) || 1, 1, this.pageCount);
      const size = Math.max(1, Number(state.pageSize) || 10);
      const start = (p - 1) * size;
      const end = start + size;
      return this.filteredItems.slice(start, end);
    },

    summary(): {
      count: number;
      amountTotal: number;
      feeTotal: number;
      netTotal: number;
      refundedCount: number;
      refundedTotal: number;
    } {
      const arr = this.filteredItems;
      let amountTotal = 0;
      let feeTotal = 0;
      let netTotal = 0;

      let refundedCount = 0;
      let refundedTotal = 0;

      for (const x of arr) {
        amountTotal += Number(x.amount) || 0;
        feeTotal += Number(x.fee) || 0;
        netTotal += Number(x.net) || 0;

        if (x.status === "refunded") {
          refundedCount += 1;
          refundedTotal += Number(x.amount) || 0;
        }
      }

      return {
        count: arr.length,
        amountTotal: money(amountTotal),
        feeTotal: money(feeTotal),
        netTotal: money(netTotal),
        refundedCount,
        refundedTotal: money(refundedTotal),
      };
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
      const today = parseYMD(this.todayYMD) || new Date();
      this.filters.dateTo = toYMD(today);
      this.filters.dateFrom = toYMD(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
      this.filters.brandId = "";
      this.filters.paymentMethod = "";
      this.filters.status = "";
      this.filters.keyword = "";
      this.page = 1;
    },

    setPage(p: number) {
      const next = clamp(Number(p) || 1, 1, this.pageCount);
      this.page = next;
    },

    setPageSize(size: number) {
      const nextSize = Math.max(1, Number(size) || 10);
      this.pageSize = nextSize;
      this.page = 1;
    },

    toggleSort(key: SortKey) {
      const allowed: SortKey[] = ["date", "amount", "fee", "net", "status", "brand", "payment", "orderNo", ""];
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
        this.sort.key = "date";
        this.sort.dir = "desc";
        this.page = 1;
        return;
      }

      this.sort.dir = "asc";
      this.page = 1;
    },

    buildExportRows(scope: "filtered" | "page" = "filtered") {
      const list = scope === "page" ? this.pageItems : this.filteredItems;

      return list.map((x) => {
        const brand = this.brandLabelMap[x.brandId] || x.brandId;
        const pay = this.paymentLabelMap[x.paymentMethod] || x.paymentMethod;
        const status =
          x.status === "pending"
            ? "待入帳"
            : x.status === "settled"
            ? "已入帳"
            : x.status === "refunded"
            ? "已退款"
            : x.status === "void"
            ? "已作廢"
            : "失敗/異常";

        return {
          date: x.date,
          orderNo: x.orderNo,
          txNo: x.txNo,
          brand,
          payment: pay,
          amount: x.amount,
          fee: x.fee,
          net: x.net,
          status,
          settledAt: x.settledAt || "",
          note: x.note || "",
        };
      });
    },

    exportCsv(scope: "filtered" | "page" = "filtered") {
      const rows = this.buildExportRows(scope);

      const headers = [
        { key: "date", label: "日期" },
        { key: "orderNo", label: "訂單號" },
        { key: "txNo", label: "交易序號" },
        { key: "brand", label: "品牌" },
        { key: "payment", label: "付款方式" },
        { key: "amount", label: "交易金額" },
        { key: "fee", label: "手續費" },
        { key: "net", label: "淨入帳" },
        { key: "status", label: "對帳狀態" },
        { key: "settledAt", label: "入帳時間" },
        { key: "note", label: "備註" },
      ];

      const csv = toCsv(rows, headers);
      const from = this.filters.dateFrom || "";
      const to = this.filters.dateTo || "";
      const filename = `reconciliation_${from}_${to}.csv`;

      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
      downloadBlob(filename, blob);
    },

    exportXls(scope: "filtered" | "page" = "filtered") {
      const rows = this.buildExportRows(scope);

      const headers = [
        { key: "date", label: "日期" },
        { key: "orderNo", label: "訂單號" },
        { key: "txNo", label: "交易序號" },
        { key: "brand", label: "品牌" },
        { key: "payment", label: "付款方式" },
        { key: "amount", label: "交易金額" },
        { key: "fee", label: "手續費" },
        { key: "net", label: "淨入帳" },
        { key: "status", label: "對帳狀態" },
        { key: "settledAt", label: "入帳時間" },
        { key: "note", label: "備註" },
      ];

      const from = this.filters.dateFrom || "";
      const to = this.filters.dateTo || "";
      const title = `reconciliation_${from}_${to}`;
      const html = toXlsHtml(rows, headers, title);

      const filename = `${title}.xls`;
      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
      downloadBlob(filename, blob);
    },
  },
});
