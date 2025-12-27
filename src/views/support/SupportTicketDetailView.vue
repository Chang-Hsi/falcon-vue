<!-- src/views/SupportTicketDetailView.vue -->
<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-start justify-between gap-3">
      <div class="flex flex-col">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          工單詳情
        </div>
        <div class="mt-1 text-sm text-slate-500">
          {{ activeTicket?.id || "—" }} ・{{ activeTicket?.subject || "—" }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          @click="goList()"
        >
          回列表
        </button>
      </div>
    </div>

    <div class="flex w-full max-h-[80vh] gap-4">
      <div
        class="hidden w-90 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 lg:flex"
      >
        <div class="border-b border-slate-100 bg-white px-4 py-3">
          <div class="text-sm font-semibold text-slate-900">工單清單</div>
          <div class="mt-2">
            <input
              v-model="sidebarKeyword"
              type="text"
              placeholder="搜尋主旨 / 工單號 / 客戶"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <div class="flex flex-col divide-y divide-slate-100">
            <button
              v-for="t in sidebarTickets"
              :key="t.id"
              type="button"
              class="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-slate-50"
              :class="t.id === activeTicket?.id ? 'bg-slate-50' : ''"
              @click="goDetail(t.id)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="text-sm font-semibold text-slate-900">{{ t.subject }}</div>
                <span
                  v-if="t.unreadCount > 0"
                  class="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200"
                >
                  {{ t.unreadCount }}
                </span>
              </div>
              <div class="text-xs text-slate-500">
                {{ t.customer.name }} ・{{ t.lastMessageAt }}
              </div>
              <div class="text-xs text-slate-500">{{ t.lastMessagePreview }}</div>
            </button>
          </div>
        </div>
      </div>

      <div
        class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
      >
        <div
          class="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <span
              v-if="activeTicket"
              class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
              :class="statusPillClass(activeTicket.status)"
            >
              {{ statusText(activeTicket.status) }}
            </span>
            <span
              v-if="activeTicket"
              class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
              :class="priorityPillClass(activeTicket.priority)"
            >
              {{ priorityText(activeTicket.priority) }}
            </span>
            <span
              v-if="activeTicket && isOverdue(activeTicket)"
              class="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
            >
              SLA 逾期
            </span>
          </div>

          <div class="text-xs text-slate-500">
            最後更新：{{ activeTicket?.lastMessageAt || "—" }}
          </div>
        </div>

        <div
          ref="messagesRef"
          class="flex w-full flex-1 flex-col gap-3 overflow-auto bg-slate-50 p-4"
          @scroll="onMessagesScroll"
        >
          <div
            v-if="messages.length === 0"
            class="flex w-full flex-1 items-center justify-center text-sm text-slate-500"
          >
            目前沒有對話紀錄
          </div>

          <div
            v-for="m in messages"
            :key="m.id"
            class="flex w-full"
            :class="messageRowClass(m.type)"
          >
            <div
              v-if="m.type === 'system'"
              class="mx-auto rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200"
            >
              <span v-if="m.createdAt">{{ m.createdAt }}</span>
              <span v-if="m.createdAt && m.content"> ・ </span>
              <span>{{ m.content }}</span>
            </div>

            <div v-else class="flex max-w-[78%] flex-col gap-1">
              <div
                class="flex items-center gap-2 text-xs text-slate-500"
                :class="m.type === 'agent' ? 'justify-end' : 'justify-start'"
              >
                <span>{{ m.senderName }}</span>
                <span>・</span>
                <span>{{ m.createdAt }}</span>
              </div>

              <div
                class="whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1"
                :class="messageBubbleClass(m.type)"
              >
                {{ m.content }}
              </div>

              <div
                v-if="m.type === 'agent'"
                class="mt-1 flex justify-end text-[11px] text-slate-400"
              >
                <span>{{ agentStatusText(m.id) }}</span>
                <span class="ml-1">{{ agentStatusTick(m.id) }}</span>
              </div>
            </div>
          </div>

          <div v-if="customerTyping" class="flex w-full justify-start">
            <div class="flex max-w-[78%] flex-col gap-1">
              <div class="text-xs text-slate-500">對方正在輸入…</div>
              <div
                class="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200"
              >
                …
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 bg-white p-4">
          <div class="flex w-full items-center gap-2">
            <button
              type="button"
              class="btn btn-sm rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              :class="
                composerMode === 'reply'
                  ? 'bg-slate-900 text-slate-900 border-slate-900'
                  : ''
              "
              @click="composerMode = 'reply'"
            >
              回覆
            </button>
            <button
              type="button"
              class="btn btn-sm rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              :class="
                composerMode === 'internal'
                  ? 'bg-slate-900 text--slate-700 border-slate-900'
                  : ''
              "
              @click="composerMode = 'internal'"
            >
              內部備註
            </button>
          </div>

          <div class="mt-3 flex w-full items-end gap-3">
            <textarea
              v-model="composerText"
              rows="3"
              class="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              :placeholder="
                composerMode === 'reply' ? '輸入回覆內容…' : '輸入內部備註（客戶看不到）…'
              "
              @keydown="onComposerKeydown"
              @compositionstart="onCompositionStart"
              @compositionend="onCompositionEnd"
            ></textarea>

            <button
              type="button"
              class="btn btn-sm rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
              :disabled="!canSend || isSending"
              @click="send()"
            >
              {{ isSending ? "送出中…" : "送出" }}
            </button>
          </div>

          <div v-if="composerMode === 'internal'" class="mt-2 text-xs text-amber-700">
            內部備註只會顯示給客服人員，不會推送給客戶
          </div>
        </div>
      </div>

      <div
        class="hidden w-95 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 xl:flex"
      >
        <div class="border-b border-slate-100 bg-white px-4 py-3">
          <div class="text-sm font-semibold text-slate-900">工單資訊</div>
        </div>

        <div class="flex flex-1 flex-col gap-4 overflow-auto p-4">
          <div class="flex flex-col rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div class="flex flex-col gap-2 text-sm text-slate-700">
              <div class="flex items-center justify-between gap-3">
                <div class="text-slate-500">姓名</div>
                <div class="font-semibold text-slate-900">
                  {{ activeTicket?.customer.name || "—" }}
                </div>
              </div>
              <div class="flex items-center justify-between gap-3">
                <div class="text-slate-500">電話</div>
                <div class="font-semibold text-slate-900">
                  {{ activeTicket?.customer.phone || "—" }}
                </div>
              </div>
              <div class="flex items-center justify-between gap-3">
                <div class="text-slate-500">Email</div>
                <div class="font-semibold text-slate-900">
                  {{ activeTicket?.customer.email || "—" }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div class="text-sm font-semibold text-slate-900">處理設定</div>

            <div class="flex flex-col gap-2">
              <div class="text-xs font-semibold text-slate-500">狀態</div>
              <select
                v-model="edit.status"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="new">新建立</option>
                <option value="open">處理中</option>
                <option value="pending">等待回覆</option>
                <option value="solved">已解決</option>
                <option value="closed">已結案</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <div class="text-xs font-semibold text-slate-500">優先級</div>
              <select
                v-model="edit.priority"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="urgent">緊急</option>
                <option value="high">高</option>
                <option value="normal">一般</option>
                <option value="low">低</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <div class="text-xs font-semibold text-slate-500">渠道</div>
              <select
                v-model="edit.channel"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="app">App</option>
                <option value="web">Web</option>
                <option value="email">Email</option>
                <option value="phone">電話</option>
                <option value="line">LINE</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <div class="text-xs font-semibold text-slate-500">指派客服</div>
              <select
                v-model="edit.assigneeId"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="">未指派</option>
                <option v-for="a in store.agents" :key="a.id" :value="a.id">
                  {{ a.name }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <div class="text-xs font-semibold text-slate-500">標籤（用逗號分隔）</div>
              <input
                v-model="edit.tagsText"
                type="text"
                placeholder="例如：票券, 核銷, 帳務"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
              <div class="text-xs text-slate-500">
                目前：{{
                  activeTicket?.tags?.length ? activeTicket.tags.join("、") : "—"
                }}
              </div>
            </div>

            <button
              type="button"
              class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              :disabled="!canSave"
              @click="save()"
            >
              儲存設定
            </button>
          </div>

          <div
            class="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
          >
            <div class="text-sm font-semibold text-slate-900">時間資訊</div>
            <div class="mt-2 flex flex-col gap-2 text-sm text-slate-700">
              <div class="flex items-center justify-between gap-3">
                <div class="text-slate-500">建立時間</div>
                <div class="font-semibold text-slate-900">
                  {{ activeTicket?.createdAt || "—" }}
                </div>
              </div>
              <div class="flex items-center justify-between gap-3">
                <div class="text-slate-500">更新時間</div>
                <div class="font-semibold text-slate-900">
                  {{ activeTicket?.updatedAt || "—" }}
                </div>
              </div>
              <div class="flex items-center justify-between gap-3">
                <div class="text-slate-500">SLA 截止</div>
                <div class="font-semibold text-slate-900">
                  {{ activeTicket?.slaDueAt || "—" }}
                </div>
              </div>
            </div>

            <div
              v-if="activeTicket && isOverdue(activeTicket)"
              class="mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200"
            >
              此工單已超過 SLA 截止時間，建議優先處理或更新狀態
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 xl:hidden"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="text-sm font-semibold text-slate-900">工單資訊</div>
        <button
          type="button"
          class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          :disabled="!canSave"
          @click="save()"
        >
          儲存設定
        </button>
      </div>

      <div class="flex w-full flex-wrap gap-3">
        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">狀態</div>
          <select
            v-model="edit.status"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
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
            v-model="edit.priority"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="urgent">緊急</option>
            <option value="high">高</option>
            <option value="normal">一般</option>
            <option value="low">低</option>
          </select>
        </div>

        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">指派客服</div>
          <select
            v-model="edit.assigneeId"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">未指派</option>
            <option v-for="a in store.agents" :key="a.id" :value="a.id">
              {{ a.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex w-full flex-col gap-1">
        <div class="text-xs font-semibold text-slate-500">標籤（用逗號分隔）</div>
        <input
          v-model="edit.tagsText"
          type="text"
          placeholder="例如：票券, 核銷, 帳務"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useAdminSupportTicketStore,
  type TicketMessage,
  type TicketStatus,
  type TicketPriority,
  type TicketChannel,
  type TicketTag,
  type SupportTicket,
} from "@/stores/adminSupportTicketStore";

type MsgType = "system" | "agent" | "customer" | "internal";

type LocalMessage = {
  id: string;
  type: MsgType;
  senderName: string;
  content: string;
  createdAt: string;
};

type AnyMessage = TicketMessage | LocalMessage;

type DeliveryStatus = "sending" | "sent" | "delivered" | "read";

const router = useRouter();
const route = useRoute();
const store = useAdminSupportTicketStore();

const messagesRef = ref<HTMLElement | null>(null);

const ticketId = computed(() => String(route.params.id || ""));

const activeTicket = computed<SupportTicket | null>(() => {
  if (!ticketId.value) return null;
  return store.getTicketById(ticketId.value);
});

const storeMessages = computed<TicketMessage[]>(() => {
  if (!ticketId.value) return [];
  return store.getMessagesByTicket(ticketId.value);
});

const localMessages = ref<LocalMessage[]>([]);

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

function dateOnlyText(timeText: string) {
  const s = String(timeText || "");
  return s.includes(" ") ? s.split(" ")[0] : s;
}

function formatDateSeparator(dateText: string) {
  return String(dateText || "");
}

function makeLocalMessage(payload: Partial<LocalMessage>): LocalMessage {
  return {
    id: payload.id || `local_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type: (payload.type || "system") as MsgType,
    senderName: payload.senderName || "",
    content: payload.content || "",
    createdAt: payload.createdAt || nowText(),
  };
}

const messages = computed<AnyMessage[]>(() => {
  const merged: AnyMessage[] = [...(storeMessages.value || []), ...(localMessages.value || [])];

  merged.sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));

  const out: AnyMessage[] = [];
  let lastDate = "";

  for (const m of merged) {
    const d = dateOnlyText(String(m.createdAt || ""));
    if (d && d !== lastDate) {
      lastDate = d;
      out.push(
        makeLocalMessage({
          type: "system",
          createdAt: formatDateSeparator(d),
          content: "",
        })
      );
    }
    out.push(m);
  }
  return out;
});

const sidebarKeyword = ref<string>("");

const sidebarTickets = computed(() => {
  const kw = String(sidebarKeyword.value || "").trim();
  const base = store.filteredTickets;

  if (!kw) return base.slice(0, 50);

  return base
    .filter((t) => {
      const inCustomer =
        String(t.customer.name || "").includes(kw) ||
        String(t.customer.email || "").includes(kw) ||
        String(t.customer.phone || "").includes(kw);

      return (
        String(t.subject || "").includes(kw) ||
        String(t.id || "").includes(kw) ||
        inCustomer
      );
    })
    .slice(0, 50);
});

type EditModel = {
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  assigneeId: string;
  tagsText: string;
};

const edit = reactive<EditModel>({
  status: "open",
  priority: "normal",
  channel: "web",
  assigneeId: "",
  tagsText: "",
});

watch(
  () => activeTicket.value,
  (t) => {
    if (!t) return;
    edit.status = t.status;
    edit.priority = t.priority;
    edit.channel = t.channel;
    edit.assigneeId = t.assignee?.id || "";
    edit.tagsText = t.tags?.length ? t.tags.join(", ") : "";
  },
  { immediate: true }
);

const composerMode = ref<"reply" | "internal">("reply");
const composerText = ref<string>("");

const canSend = computed(() => {
  return !!ticketId.value && String(composerText.value || "").trim().length > 0;
});

const canSave = computed(() => {
  if (!activeTicket.value) return false;

  const t = activeTicket.value;
  const tagsText = String(edit.tagsText || "").trim();

  const sameStatus = edit.status === t.status;
  const samePriority = edit.priority === t.priority;
  const sameChannel = edit.channel === t.channel;
  const sameAssignee = String(edit.assigneeId || "") === String(t.assignee?.id || "");
  const sameTags = tagsText === (t.tags?.length ? t.tags.join(", ") : "");

  return !(sameStatus && samePriority && sameChannel && sameAssignee && sameTags);
});

function goList() {
  router.push({ name: "SupportTicketList" });
}

function goDetail(id: string) {
  router.push({ name: "SupportTicketDetail", params: { id } });
}

const allowAutoScroll = ref<boolean>(true);

function onMessagesScroll() {
  const el = messagesRef.value;
  if (!el) return;
  const threshold = 140;
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  allowAutoScroll.value = distanceToBottom < threshold;
}

async function scrollToBottom(force: boolean) {
  await nextTick();
  const el = messagesRef.value;
  if (!el) return;
  if (!force && !allowAutoScroll.value) return;
  el.scrollTop = el.scrollHeight;
}

const agentDeliveryMap = ref<Record<string, DeliveryStatus>>({});

function setAgentStatus(id: string, status: DeliveryStatus) {
  agentDeliveryMap.value = { ...agentDeliveryMap.value, [id]: status };
}

function agentStatusText(id: string) {
  const s = agentDeliveryMap.value[id] || "sent";
  if (s === "sending") return "送出中";
  if (s === "sent") return "已送出";
  if (s === "delivered") return "已送達";
  return "已讀";
}

function agentStatusTick(id: string) {
  const s = agentDeliveryMap.value[id] || "sent";
  if (s === "sending") return "…";
  if (s === "sent") return "✓";
  if (s === "delivered") return "✓✓";
  return "✓✓";
}

const customerTyping = ref<boolean>(false);
const isSending = ref<boolean>(false);

function randomCustomerReply() {
  const pool = [
    "好的，我了解了，謝謝！",
    "我剛剛補充了一些資訊，麻煩你看一下。",
    "我這邊還是不太確定，可以再說明一次嗎？",
    "可以的，我晚點再提供截圖。",
    "收到，我再測試一次。",
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

const isComposing = ref<boolean>(false);

// 防連點（同時防 Enter、按鈕連點）
const sendLock = ref<boolean>(false);
let sendLockTimer: number | null = null;

function onCompositionStart() {
  isComposing.value = true;
}

function onCompositionEnd() {
  // 有些輸入法 compositionend 後同一個 tick 還會接到 Enter
  // 所以延後一個 microtask 再解除
  Promise.resolve().then(() => {
    isComposing.value = false;
  });
}

function onComposerKeydown(e: KeyboardEvent) {
  if (e.key !== "Enter") return;
  if (e.shiftKey) return;

  // 中文/日文輸入法組字中，Enter 是「選字」不是「送出」
  // 兩種判斷都加：isComposing + 原生事件的 isComposing
  const nativeAny = e as unknown as { isComposing?: boolean };
  if (isComposing.value || nativeAny.isComposing) return;

  e.preventDefault();
  if (!canSend.value || isSending.value || sendLock.value) return;
  send();
}

function send() {
  const tid = ticketId.value;
  if (!tid) return;

  // 防連點：避免 Enter 連發/按鈕連點
  if (sendLock.value) return;
  sendLock.value = true;

  if (sendLockTimer) window.clearTimeout(sendLockTimer);
  sendLockTimer = window.setTimeout(() => {
    sendLock.value = false;
  }, 550);

  const text = String(composerText.value || "").trim();
  if (!text) {
    // 沒內容也要解鎖，不然會卡住
    sendLock.value = false;
    return;
  }

  isSending.value = true;

  try {
    if (composerMode.value === "reply") {
      store.addAgentReply(tid, text, store.agents[0]?.name || "客服");
    } else {
      store.addInternalNote(tid, text, store.agents[0]?.name || "客服");
    }

    composerText.value = "";
    scrollToBottom(true);

    if (composerMode.value === "reply") {
      nextTick().then(() => {
        const latestAgent = [...(storeMessages.value || [])]
          .slice()
          .reverse()
          .find((m) => m.type === "agent" && String(m.content || "") === text);

        if (latestAgent?.id) {
          setAgentStatus(latestAgent.id, "sending");
          setTimeout(() => setAgentStatus(latestAgent.id, "sent"), 250);
          setTimeout(() => setAgentStatus(latestAgent.id, "delivered"), 900);
          setTimeout(() => setAgentStatus(latestAgent.id, "read"), 1700);
        }
      });

      customerTyping.value = true;

      setTimeout(() => {
        customerTyping.value = false;

        localMessages.value.push(
          makeLocalMessage({
            type: "customer",
            senderName: activeTicket.value?.customer?.name || "客戶",
            content: randomCustomerReply(),
            createdAt: nowText(),
          })
        );

        scrollToBottom(true);
      }, 1400);
    }
  } finally {
    // 送出按鈕的 loading 你本來是 300ms，保留
    setTimeout(() => {
      isSending.value = false;
    }, 300);

    // sendLock 由上面的 timer 解鎖，避免極短時間連發
  }
}


function save() {
  const t = activeTicket.value;
  if (!t) return;

  const assigneeId = String(edit.assigneeId || "").trim();
  const assignee = assigneeId ? store.agents.find((a) => a.id === assigneeId) || null : null;

  const tagsText = String(edit.tagsText || "").trim();
  const tags = tagsText
    ? tagsText
        .split(",")
        .map((x) => x.trim())
        .filter((x) => !!x)
        .slice(0, 6)
        .map((x) => x as TicketTag)
    : [];

  store.updateTicket({
    id: t.id,
    status: edit.status,
    priority: edit.priority,
    channel: edit.channel,
    assignee,
    tags,
  });

  store.addSystemMessage(t.id, "系統：工單設定已更新。");
  scrollToBottom(true);
}

watch(
  () => ticketId.value,
  (id) => {
    if (!id) return;

    localMessages.value = [];
    customerTyping.value = false;
    isSending.value = false;
    agentDeliveryMap.value = {};
    allowAutoScroll.value = true;

    store.setActiveTicket(id);
    store.ensureSlaIfMissing(id);

    scrollToBottom(true);
  },
  { immediate: true }
);

watch(
  () => messages.value.length,
  () => {
    scrollToBottom(false);
  }
);

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

function messageRowClass(type: string) {
  if (type === "agent") return "justify-end";
  if (type === "internal") return "justify-center";
  if (type === "customer") return "justify-start";
  return "justify-center";
}

function messageBubbleClass(type: string) {
  if (type === "agent") return "bg-slate-900 text-white ring-slate-900";
  if (type === "internal") return "bg-amber-50 text-amber-900 ring-amber-200";
  return "bg-white text-slate-800 ring-slate-200";
}

onMounted(() => {
  scrollToBottom(true);
});
</script>
