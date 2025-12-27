<!-- src/views/MemberListView.vue -->
<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-start justify-between gap-3">
      <div class="flex flex-col">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          會員管理
        </div>
        <div class="mt-1 text-sm text-slate-500">
          快速搜尋會員、批次操作、點擊列進入詳情頁
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          @click="resetFilters()"
        >
          重設
        </button>
        <button
          type="button"
          class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          @click="applyFilters()"
        >
          套用
        </button>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
    >
      <div class="flex w-full flex-wrap items-end gap-3">
        <div class="flex min-w-55 flex-2 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">關鍵字</div>
          <input
            v-model="draft.keyword"
            type="text"
            placeholder="姓名 / Email / Phone / 會員ID"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">狀態</div>
          <select
            v-model="draft.status"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option value="enabled">啟用</option>
            <option value="disabled">停用</option>
            <option value="blocked">封鎖</option>
          </select>
        </div>

        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">等級</div>
          <select
            v-model="draft.level"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option value="normal">一般</option>
            <option value="vip">VIP</option>
            <option value="business">企業</option>
          </select>
        </div>

        <div class="flex min-w-45 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">標籤</div>
          <select
            v-model="draft.tag"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option v-for="t in store.allTags" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="flex min-w-42.5 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">註冊起日</div>
          <input
            v-model="draft.joinedFrom"
            type="date"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div class="flex min-w-42.5 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">註冊迄日</div>
          <input
            v-model="draft.joinedTo"
            type="date"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div class="flex min-w-55 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">排序</div>
          <div class="flex w-full items-center gap-2">
            <select
              v-model="draft.sortField"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="joinedAt">註冊時間</option>
              <option value="lastLoginAt">最後登入</option>
              <option value="name">姓名</option>
            </select>
            <select
              v-model="draft.sortDir"
              class="w-30 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="desc">新 → 舊</option>
              <option value="asc">舊 → 新</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="store.selectedCount > 0"
      class="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white"
    >
      <div class="flex items-center gap-2 text-sm">
        <div class="font-semibold">已選 {{ store.selectedCount }} 筆</div>
        <button
          type="button"
          class="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
          @click="clearSelection()"
        >
          清除選取
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="bulkReason"
          type="text"
          placeholder="狀態變更原因（選填）"
          class="w-55 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white outline-none placeholder:text-white/60 focus:border-white/30"
        />

        <button
          type="button"
          class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
          :disabled="isBulkBusy"
          @click="bulkSetStatus('enabled')"
        >
          批次啟用
        </button>
        <button
          type="button"
          class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
          :disabled="isBulkBusy"
          @click="bulkSetStatus('disabled')"
        >
          批次停用
        </button>
        <button
          type="button"
          class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
          :disabled="isBulkBusy"
          @click="bulkSetStatus('blocked')"
        >
          批次封鎖
        </button>

        <div class="flex items-center gap-2">
          <select
            v-model="bulkTag"
            class="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
          >
            <option value="">選擇標籤</option>
            <option v-for="t in store.allTags" :key="t" :value="t">{{ t }}</option>
          </select>

          <button
            type="button"
            class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            :disabled="isBulkBusy || !bulkTag"
            @click="bulkAddTag()"
          >
            批次加標籤
          </button>
          <button
            type="button"
            class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            :disabled="isBulkBusy || !bulkTag"
            @click="bulkRemoveTag()"
          >
            批次移除標籤
          </button>

          <button
            type="button"
            class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            :disabled="isBulkBusy"
            @click="exportSelectedCsv()"
          >
            匯出 CSV
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
    >
      <div
        class="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3"
      >
        <div class="flex items-center gap-2">
          <div class="text-sm font-semibold text-slate-900">會員列表</div>
          <div class="text-xs text-slate-500">共 {{ store.total }} 筆</div>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model.number="pageSizeModel"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option :value="12">12 / 頁</option>
            <option :value="24">24 / 頁</option>
            <option :value="48">48 / 頁</option>
          </select>
        </div>
      </div>

      <div class="w-full flex-1 overflow-auto">
        <table class="w-full min-w-245 table-fixed">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold text-slate-600">
              <th class="w-14 px-4 py-3">
                <input
                  type="checkbox"
                  class="h-4 w-4"
                  :checked="isAllOnPageSelected"
                  @click.stop
                  @change="toggleSelectAllOnPage($event)"
                />
              </th>
              <th class="w-55 px-4 py-3">Name</th>
              <th class="w-55 px-4 py-3">Email</th>
              <th class="w-40 px-4 py-3">Phone</th>
              <th class="w-90 px-4 py-3">Billing Address</th>
              <th class="w-37.5 px-4 py-3">Joined</th>
              <th class="w-17.5 px-4 py-3"></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="m in store.pageMembers"
              :key="m.id"
              class="cursor-pointer text-sm text-slate-700 hover:bg-slate-50"
              @click="goDetail(m.id)"
            >
              <td class="px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  class="h-4 w-4"
                  :checked="store.isSelected(m.id)"
                  @change="store.toggleSelect(m.id)"
                />
              </td>

              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-xs font-bold text-white"
                  >
                    <img
                      v-if="String(m.avatarUrl || '').trim() && !avatarBroken[m.id]"
                      :src="String(m.avatarUrl || '').trim()"
                      alt="avatar"
                      class="h-full w-full object-cover"
                      @error="onAvatarError(m.id)"
                    />
                    <span v-else>{{ initials(m.name) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <div class="truncate font-semibold text-slate-900">
                        {{ m.name }}
                      </div>
                    </div>
                    <div class="mt-0.5 text-xs text-slate-500">{{ m.id }}</div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-3">
                <a
                  class="text-sky-700 hover:underline"
                  :href="`mailto:${m.email}`"
                  @click.stop
                >
                  {{ m.email }}
                </a>
              </td>

              <td class="px-4 py-3">
                <a
                  class="text-sky-700 hover:underline"
                  :href="`tel:${m.phone}`"
                  @click.stop
                >
                  {{ m.phone }}
                </a>
              </td>

              <td class="px-4 py-3">
                <div class="truncate text-slate-600" :title="m.billingAddress">
                  {{ m.billingAddress }}
                </div>
              </td>

              <td class="px-4 py-3 text-slate-600">
                {{ m.joinedAt }}
              </td>

              <td class="px-4 py-3" @click.stop>
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  @click="openRowMenu(m.id)"
                >
                  ···
                </button>
              </td>
            </tr>

            <tr v-if="store.pageMembers.length === 0">
              <td class="px-4 py-10 text-center text-sm text-slate-500" colspan="7">
                沒有符合條件的會員
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination :page="store.page" :page-count="store.pageCount" @change="setPage" />
    </div>

    <div
      v-if="rowMenu.open"
      class="fixed inset-0 z-50 flex items-start justify-end"
      @mousedown.self="closeRowMenu()"
    >
      <div class="absolute inset-0 bg-slate-900/20"></div>

      <!-- 點擊操作出現的畫面，改為daisyUI的選單 -->
      <div
        class="relative mr-4 mt-24 w-65 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div class="flex flex-col p-2">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            @click="goDetail(rowMenu.memberId)"
          >
            查看詳情
            <span class="text-slate-400">→</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            @click="quickToggleStatus()"
          >
            快速切換啟用/停用
            <span class="text-slate-400">⇄</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            @click="exportOneCsv()"
          >
            匯出此會員 CSV
            <span class="text-slate-400">↓</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppPagination from "@/components/common/AppPagination.vue";
import { useAdminMemberStore, type MemberStatus, type MemberSortField, type SortDir } from "@/stores/adminMemberStore";

const router = useRouter();
const route = useRoute();
const store = useAdminMemberStore();

type Draft = {
  keyword: string;
  status: "" | MemberStatus;
  level: "" | "normal" | "vip" | "business";
  tag: string;
  joinedFrom: string;
  joinedTo: string;
  sortField: MemberSortField;
  sortDir: SortDir;
};

const draft = reactive<Draft>({
  keyword: store.filters.keyword,
  status: store.filters.status,
  level: store.filters.level,
  tag: store.filters.tag,
  joinedFrom: store.filters.joinedFrom,
  joinedTo: store.filters.joinedTo,
  sortField: store.sort.field,
  sortDir: store.sort.dir,
});

const avatarBroken = reactive<Record<string, boolean>>({});
const lastAvatarUrl = reactive<Record<string, string>>({});

function onAvatarError(id: string) {
  const mid = String(id || "");
  if (!mid) return;
  avatarBroken[mid] = true;
}

watch(
  () => store.pageMembers.map((m) => ({ id: m.id, avatarUrl: String(m.avatarUrl || "").trim() })),
  (arr) => {
    for (const it of arr) {
      const id = String(it.id || "");
      if (!id) continue;

      const url = String(it.avatarUrl || "");
      if (lastAvatarUrl[id] !== url) {
        lastAvatarUrl[id] = url;
        avatarBroken[id] = false;
      }
    }
  },
  { immediate: true, deep: true }
);


watch(
  () => store.filters,
  (next) => {
    draft.keyword = next.keyword;
    draft.status = next.status;
    draft.level = next.level;
    draft.tag = next.tag;
    draft.joinedFrom = next.joinedFrom;
    draft.joinedTo = next.joinedTo;
  },
  { deep: true }
);

watch(
  () => store.sort,
  (s) => {
    draft.sortField = s.field;
    draft.sortDir = s.dir;
  },
  { deep: true }
);

const pageSizeModel = computed<number>({
  get() {
    return store.pageSize;
  },
  set(v) {
    store.setPageSize(Number(v) || 12);
  },
});

function initials(name: string) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "MB";
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] || "") : "";
  return (a + b).toUpperCase() || "MB";
}

function statusText(s: MemberStatus) {
  if (s === "enabled") return "啟用";
  if (s === "disabled") return "停用";
  return "封鎖";
}

function levelText(l: string) {
  if (l === "vip") return "VIP";
  if (l === "business") return "企業";
  return "一般";
}

function statusPillClass(s: MemberStatus) {
  if (s === "enabled") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "disabled") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}

function applyFilters() {
  store.setFilters({
    keyword: draft.keyword,
    status: draft.status,
    level: draft.level,
    tag: draft.tag,
    joinedFrom: draft.joinedFrom,
    joinedTo: draft.joinedTo,
  });
  store.setSort(draft.sortField, draft.sortDir);
  store.applyFilters();
}

function resetFilters() {
  store.resetFilters();
}

function setPage(p: number) {
  store.setPage(p);
}

function goDetail(id: string) {
  router.push({ name: "MemberDetail", params: { id } });
}

const isAllOnPageSelected = computed(() => {
  if (!store.pageMembers.length) return false;
  return store.pageMembers.every((m) => store.isSelected(m.id));
});

function toggleSelectAllOnPage(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) store.selectAllOnPage();
  else store.unselectAllOnPage();
}

function clearSelection() {
  store.clearSelection();
}

const bulkReason = ref<string>("");
const bulkTag = ref<string>("");
const isBulkBusy = ref<boolean>(false);

function bulkSetStatus(status: MemberStatus) {
  if (isBulkBusy.value) return;
  isBulkBusy.value = true;
  try {
    store.bulkSetStatus(status, String(bulkReason.value || "").trim());
  } finally {
    isBulkBusy.value = false;
    bulkReason.value = "";
  }
}

function bulkAddTag() {
  if (isBulkBusy.value) return;
  const t = String(bulkTag.value || "").trim();
  if (!t) return;
  isBulkBusy.value = true;
  try {
    store.bulkAddTag(t);
  } finally {
    isBulkBusy.value = false;
  }
}

function bulkRemoveTag() {
  if (isBulkBusy.value) return;
  const t = String(bulkTag.value || "").trim();
  if (!t) return;
  isBulkBusy.value = true;
  try {
    store.bulkRemoveTag(t);
  } finally {
    isBulkBusy.value = false;
  }
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportSelectedCsv() {
  const csv = store.exportCsv();
  downloadText(`members_selected_${Date.now()}.csv`, csv);
}

const rowMenu = reactive<{ open: boolean; memberId: string }>({ open: false, memberId: "" });

function openRowMenu(id: string) {
  rowMenu.open = true;
  rowMenu.memberId = String(id || "");
}

function closeRowMenu() {
  rowMenu.open = false;
  rowMenu.memberId = "";
}

function quickToggleStatus() {
  const id = rowMenu.memberId;
  const m = store.getMemberById(id);
  if (!m) return;

  const next: MemberStatus = m.status === "enabled" ? "disabled" : "enabled";
  store.updateMember({ id: m.id, status: next });
  store.addLog(m.id, "變更狀態", `status ${m.status} -> ${next}（快速操作）`);
  closeRowMenu();
}

function exportOneCsv() {
  const id = rowMenu.memberId;
  const csv = store.exportCsv([id]);
  downloadText(`member_${id}.csv`, csv);
  closeRowMenu();
}

const syncing = ref<boolean>(false);

function syncStoreFromQuery() {
  const q = route.query as Record<string, any>;
  store.setFromQuery(q);
}

function syncQueryFromStore() {
  const nextQ = store.toQueryObject();
  const curQ = { ...(route.query as Record<string, any>) };

  const a = JSON.stringify(curQ);
  const b = JSON.stringify(nextQ);
  if (a === b) return;

  syncing.value = true;
  router.replace({ query: nextQ }).finally(() => {
    syncing.value = false;
  });
}

watch(
  () => route.query,
  () => {
    if (syncing.value) return;
    syncStoreFromQuery();
  }
);

watch(
  () => [store.filters, store.sort, store.page, store.pageSize],
  () => {
    if (syncing.value) return;
    syncQueryFromStore();
  },
  { deep: true }
);

onMounted(() => {
  syncStoreFromQuery();
});
</script>
