<!-- src/views/SupportTicketListView.vue -->
<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-start justify-between gap-3">
      <div class="flex flex-col">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          客服 / 工單
        </div>
        <div class="mt-1 text-sm text-slate-500">
          快速篩選工單，點選左側可在右側預覽，進入詳情後可回覆與編輯
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
            placeholder="主旨 / 工單號 / 客戶姓名 / Email / 電話"
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
            <option value="new">新建立</option>
            <option value="open">處理中</option>
            <option value="pending">等待回覆</option>
            <option value="solved">已解決</option>
            <option value="closed">已結案</option>
          </select>
        </div>

        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">優先級</div>
          <select
            v-model="draft.priority"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option value="urgent">緊急</option>
            <option value="high">高</option>
            <option value="normal">一般</option>
            <option value="low">低</option>
          </select>
        </div>

        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">渠道</div>
          <select
            v-model="draft.channel"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option value="app">App</option>
            <option value="web">Web</option>
            <option value="email">Email</option>
            <option value="phone">電話</option>
            <option value="line">LINE</option>
          </select>
        </div>

        <div class="flex min-w-45 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">指派客服</div>
          <select
            v-model="draft.assigneeId"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option v-for="a in store.agents" :key="a.id" :value="a.id">
              {{ a.name }}
            </option>
            <option value="_unassigned">未指派</option>
          </select>
        </div>

        <label
          class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <input v-model="draft.unreadOnly" type="checkbox" class="h-4 w-4" />
          只看未讀
        </label>
      </div>
    </div>

    <div class="flex w-full">
      <div
        class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
      >
        <div
          class="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <div class="text-sm font-semibold text-slate-900">工單列表</div>
            <div class="text-xs text-slate-500">共 {{ total }} 筆</div>
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
          <table class="w-full min-w-225 table-fixed">
            <thead class="bg-slate-50">
              <tr class="text-left text-xs font-semibold text-slate-600">
                <th class="w-42.5 px-4 py-3">工單號</th>
                <th class="w-62.5 px-4 py-3">主旨</th>
                <th class="w-40 px-4 py-3">客戶</th>
                <th class="w-30 px-4 py-3">狀態</th>
                <th class="w-30 px-4 py-3">優先級</th>
                <th class="w-42.5 px-4 py-3">最後更新</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="t in pageTickets"
                :key="t.id"
                class="cursor-pointer text-sm text-slate-700 hover:bg-slate-50"
                :class="previewId === t.id ? 'bg-slate-50' : ''"
                @click="selectPreview(t.id)"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="font-semibold text-slate-900">{{ t.id }}</div>
                    <span
                      v-if="t.unreadCount > 0"
                      class="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200"
                    >
                      未讀 {{ t.unreadCount }}
                    </span>
                    <span
                      v-if="isOverdue(t)"
                      class="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
                    >
                      逾期
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3">
                  <div class="font-semibold text-slate-900">{{ t.subject }}</div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ t.lastMessagePreview }}
                  </div>
                </td>

                <td class="px-4 py-3">
                  <div class="font-semibold text-slate-900">{{ t.customer.name }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ t.customer.phone }}</div>
                </td>

                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                    :class="statusPillClass(t.status)"
                  >
                    {{ statusText(t.status) }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                    :class="priorityPillClass(t.priority)"
                  >
                    {{ priorityText(t.priority) }}
                  </span>
                </td>

                <td class="px-4 py-3 text-slate-600">
                  {{ t.lastMessageAt }}
                </td>
              </tr>

              <tr v-if="pageTickets.length === 0">
                <td class="px-4 py-8 text-center text-sm text-slate-500" colspan="6">
                  沒有符合條件的工單
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppPagination :page="page" :page-count="pageCount" @change="setPage" />
      </div>
    </div>

    <div
      class="fixed inset-0 z-50"
      :class="drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'"
    >
      <div
        class="absolute inset-0 bg-slate-900/35 transition-opacity duration-200"
        :class="drawerOpen ? 'opacity-100' : 'opacity-0'"
        @mousedown.self="closePreviewDrawer()"
      ></div>

      <div
        class="absolute right-0 top-0 flex h-full w-full max-w-140 flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200 transition-transform duration-200 ease-out"
        :class="drawerOpen ? 'translate-x-0' : 'translate-x-full'"
      >
        <div
          class="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3"
        >
          <div class="text-sm font-semibold text-slate-900">工單預覽</div>

          <div class="flex items-center gap-2">
            <button
              v-if="previewTicket"
              type="button"
              class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              @click="goDetail(previewTicket.id)"
            >
              查看詳情
            </button>

            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              @click="closePreviewDrawer()"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="flex w-full flex-1 flex-col gap-4 overflow-auto p-4">
          <div
            v-if="!previewTicket"
            class="flex w-full flex-1 items-center justify-center text-sm text-slate-500"
          >
            請從列表點選一筆工單
          </div>

          <div v-else class="flex w-full flex-col gap-4">
            <div
              class="flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-semibold text-slate-900">
                    {{ previewTicket.subject }}
                  </div>
                  <div class="mt-1 text-xs text-slate-500">{{ previewTicket.id }}</div>
                </div>

                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                  :class="statusPillClass(previewTicket.status)"
                >
                  {{ statusText(previewTicket.status) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                  :class="priorityPillClass(previewTicket.priority)"
                >
                  {{ priorityText(previewTicket.priority) }}
                </span>

                <span
                  class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  渠道：{{ channelText(previewTicket.channel) }}
                </span>

                <span
                  class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  指派：{{ previewTicket.assignee?.name || "未指派" }}
                </span>

                <span
                  v-if="isOverdue(previewTicket)"
                  class="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
                >
                  SLA 逾期
                </span>
              </div>
            </div>

            <div
              class="flex w-full flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
            >
              <div class="text-sm font-semibold text-slate-900">客戶資訊</div>

              <div class="mt-2 flex flex-col gap-2 text-sm text-slate-700">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-slate-500">姓名</div>
                  <div class="font-semibold text-slate-900">
                    {{ previewTicket.customer.name }}
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <div class="text-slate-500">電話</div>
                  <div class="font-semibold text-slate-900">
                    {{ previewTicket.customer.phone }}
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <div class="text-slate-500">Email</div>
                  <div class="font-semibold text-slate-900">
                    {{ previewTicket.customer.email }}
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex w-full flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
            >
              <div class="text-sm font-semibold text-slate-900">更新資訊</div>

              <div class="mt-2 flex flex-col gap-2 text-sm text-slate-700">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-slate-500">最後更新</div>
                  <div class="font-semibold text-slate-900">
                    {{ previewTicket.lastMessageAt }}
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <div class="text-slate-500">SLA 截止</div>
                  <div class="font-semibold text-slate-900">
                    {{ previewTicket.slaDueAt }}
                  </div>
                </div>
              </div>

              <div
                class="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200"
              >
                {{ previewTicket.lastMessagePreview || "—" }}
              </div>
            </div>

            <button
              type="button"
              class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              @click="goDetail(previewTicket.id)"
            >
              查看詳情
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import AppPagination from "@/components/common/AppPagination.vue";
import {
  useAdminSupportTicketStore,
  type TicketStatus,
  type TicketPriority,
  type TicketChannel,
  type SupportTicket,
} from "@/stores/adminSupportTicketStore";

const router = useRouter();
const store = useAdminSupportTicketStore();

type DraftFilters = {
  keyword: string;
  status: "" | TicketStatus;
  priority: "" | TicketPriority;
  channel: "" | TicketChannel;
  assigneeId: string;
  unreadOnly: boolean;
};

const draft = reactive<DraftFilters>({
  keyword: store.filters.keyword,
  status: store.filters.status,
  priority: store.filters.priority,
  channel: store.filters.channel,
  assigneeId: store.filters.assigneeId,
  unreadOnly: store.filters.unreadOnly,
});

watch(
  () => store.filters,
  (next) => {
    draft.keyword = next.keyword;
    draft.status = next.status;
    draft.priority = next.priority;
    draft.channel = next.channel;
    draft.assigneeId = next.assigneeId;
    draft.unreadOnly = next.unreadOnly;
  },
  { deep: true }
);

const page = computed(() => store.page);
const pageCount = computed(() => store.pageCount);
const total = computed(() => store.total);
const pageTickets = computed(() => store.pageTickets);

const pageSizeModel = computed<number>({
  get() {
    return store.pageSize;
  },
  set(v) {
    store.setPageSize(Number(v) || 12);
  },
});

const previewId = computed(() => store.activeTicketId);

const previewTicket = computed<SupportTicket | null>(() => {
  if (!previewId.value) return null;
  return store.getTicketById(previewId.value);
});

watch(previewTicket, (t) => {
  if (!t) closePreviewDrawer();
});

const drawerOpen = ref(false);

function closePreviewDrawer() {
  drawerOpen.value = false;
}

function applyFilters() {
  const assigneeId =
    draft.assigneeId === "_unassigned" ? "" : String(draft.assigneeId || "");

  store.setFilters({
    keyword: draft.keyword,
    status: draft.status,
    priority: draft.priority,
    channel: draft.channel,
    assigneeId,
    unreadOnly: draft.unreadOnly,
  });

  if (draft.assigneeId === "_unassigned") {
    store.setFilters({ assigneeId: "__UNASSIGNED__" });
  }

  store.applyFilters();

  if (!store.activeTicketId && store.pageTickets.length > 0) {
    store.setActiveTicket(store.pageTickets[0]?.id || "");
  }
}

function resetFilters() {
  store.resetFilters();
  store.applyFilters();

  if (!store.activeTicketId && store.pageTickets.length > 0) {
    store.setActiveTicket(store.pageTickets[0]?.id || "");
  }
}

function setPage(p: number) {
  store.setPage(p);
  const ids = store.pageTickets.map((x) => x.id);
  if (store.activeTicketId && ids.includes(store.activeTicketId)) return;
  if (store.pageTickets.length > 0) store.setActiveTicket(store.pageTickets[0]?.id || "");
}

function selectPreview(id: string) {
  store.setActiveTicket(id);
  drawerOpen.value = true;
}

function goDetail(id: string) {
  closePreviewDrawer();
  router.push({ name: "SupportTicketDetail", params: { id } });
}

const isOverdue = store.isOverdue;

function statusText(s: TicketStatus) {
  if (s === "new") return "新建立";
  if (s === "open") return "處理中";
  if (s === "pending") return "等待回覆";
  if (s === "solved") return "已解決";
  return "已結案";
}

function priorityText(p: TicketPriority) {
  if (p === "urgent") return "緊急";
  if (p === "high") return "高";
  if (p === "normal") return "一般";
  return "低";
}

function channelText(c: TicketChannel) {
  if (c === "app") return "App";
  if (c === "web") return "Web";
  if (c === "email") return "Email";
  if (c === "phone") return "電話";
  return "LINE";
}

function statusPillClass(s: TicketStatus) {
  if (s === "new") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (s === "open") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (s === "pending") return "bg-violet-50 text-violet-700 ring-violet-200";
  if (s === "solved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function priorityPillClass(p: TicketPriority) {
  if (p === "urgent") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (p === "high") return "bg-orange-50 text-orange-700 ring-orange-200";
  if (p === "normal") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

if (!store.activeTicketId && store.pageTickets.length > 0) {
  store.setActiveTicket(store.pageTickets[0]?.id || "");
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closePreviewDrawer();
}

watch(drawerOpen, (open) => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = open ? "hidden" : "";
});

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (typeof document !== "undefined") document.body.style.overflow = "";
});
</script>
