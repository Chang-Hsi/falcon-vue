<!-- src/views/MemberDetailView.vue -->
<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-start justify-between gap-3">
      <div class="flex flex-col">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          會員詳情
        </div>
        <div class="mt-1 text-sm text-slate-500">
          {{ member?.id || "—" }} ・{{ member?.name || "—" }}
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

        <button
          v-if="member"
          type="button"
          class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          @click="toggleEdit()"
        >
          {{ isEditing ? "切回檢視" : "編輯" }}
        </button>
      </div>
    </div>

    <div
      v-if="!member"
      class="flex w-full items-center justify-center rounded-2xl bg-white p-10 ring-1 ring-slate-200"
    >
      <div class="text-sm text-slate-500">找不到此會員</div>
    </div>

    <div v-else class="flex w-full min-h-[70vh] gap-4">
      <div class="flex min-w-0 flex-1 flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
        >
          <div class="flex w-full flex-wrap items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-extrabold text-white"
                :class="
                  isEditing
                    ? 'cursor-pointer ring-2 ring-slate-200 hover:ring-slate-300'
                    : ''
                "
                @click="onAvatarClick()"
              >
                <img
                  v-if="hasAvatar && !avatarBroken"
                  :src="currentAvatarUrl"
                  alt="avatar"
                  class="h-full w-full object-cover"
                  @error="onAvatarError"
                />
                <span v-else>{{ initials(member.name) }}</span>
              </button>

              <input
                ref="avatarInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onAvatarFileChange"
              />

              <div class="flex min-w-0 flex-1 flex-col">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="text-base font-extrabold text-slate-900">
                    {{ member.name }}
                  </div>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                    :class="statusPillClass(member.status)"
                  >
                    {{ statusText(member.status) }}
                  </span>
                  <span
                    class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                  >
                    {{ levelText(member.level) }}
                  </span>
                </div>
                <div class="mt-1 text-xs text-slate-500">
                  註冊：{{ member.joinedAt }} ・最後登入：{{ member.lastLoginAt }}
                </div>
                <div v-if="isEditing" class="mt-1 text-[11px] text-slate-500">
                  點擊頭像可上傳本機圖片（儲存後才會套用）
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="exportOneCsv()"
              >
                匯出 CSV
              </button>

              <button
                type="button"
                class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="simulateResendVerify()"
              >
                重寄驗證
              </button>

              <button
                type="button"
                class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="simulateForceLogout()"
              >
                強制登出
              </button>
            </div>
          </div>

          <div class="flex w-full flex-wrap items-center gap-2">
            <span
              v-for="t in member.tags"
              :key="t"
              class="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
            >
              {{ t }}
            </span>

            <span v-if="member.tags.length === 0" class="text-xs text-slate-400"
              >沒有標籤</span
            >
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
        >
          <div class="flex w-full items-center justify-between gap-3">
            <div class="text-sm font-semibold text-slate-900">基本資料</div>

            <div class="flex items-center gap-2">
              <button
                v-if="isEditing"
                type="button"
                class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="cancelEdit()"
              >
                取消
              </button>

              <button
                v-if="isEditing"
                type="button"
                class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                :disabled="!canSave"
                @click="save()"
              >
                儲存
              </button>
            </div>
          </div>

          <div class="flex w-full flex-col gap-3">
            <div class="flex w-full flex-wrap gap-3">
              <div class="flex min-w-55 flex-1 flex-col gap-1">
                <div class="text-xs font-semibold text-slate-500">姓名</div>
                <input
                  v-model="edit.name"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  :disabled="!isEditing"
                />
              </div>

              <div class="flex min-w-55 flex-1 flex-col gap-1">
                <div class="text-xs font-semibold text-slate-500">Email（只讀）</div>
                <input
                  :value="member.email"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
                  disabled
                />
              </div>
            </div>

            <div class="flex w-full flex-wrap gap-3">
              <div class="flex min-w-55 flex-1 flex-col gap-1">
                <div class="text-xs font-semibold text-slate-500">電話</div>
                <input
                  v-model="edit.phone"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  :disabled="!isEditing"
                />
              </div>

              <div class="flex min-w-55 flex-1 flex-col gap-1">
                <div class="text-xs font-semibold text-slate-500">等級</div>
                <select
                  v-model="edit.level"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  :disabled="!isEditing"
                >
                  <option value="normal">一般</option>
                  <option value="vip">VIP</option>
                  <option value="business">企業</option>
                </select>
              </div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-semibold text-slate-500">帳單地址</div>
              <input
                v-model="edit.billingAddress"
                type="text"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                :disabled="!isEditing"
              />
            </div>
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
        >
          <div class="flex w-full items-center justify-between gap-3">
            <div class="text-sm font-semibold text-slate-900">操作紀錄</div>
            <div class="text-xs text-slate-500">最新 {{ logs.length }} 筆</div>
          </div>

          <div class="flex w-full flex-col divide-y divide-slate-100">
            <div v-for="l in logs" :key="l.id" class="flex w-full flex-col gap-1 py-3">
              <div class="flex w-full flex-wrap items-center justify-between gap-2">
                <div class="text-sm font-semibold text-slate-900">{{ l.action }}</div>
                <div class="text-xs text-slate-500">{{ l.createdAt }}</div>
              </div>
              <div class="text-xs text-slate-500">操作者：{{ l.actor }}</div>
              <div class="text-sm text-slate-700">{{ l.detail }}</div>
            </div>

            <div v-if="logs.length === 0" class="py-8 text-center text-sm text-slate-500">
              尚無操作紀錄
            </div>
          </div>
        </div>
      </div>

      <div class="hidden w-95 flex-col gap-4 xl:flex">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
        >
          <div class="text-sm font-semibold text-slate-900">狀態與標籤</div>

          <div class="flex w-full flex-col gap-2">
            <div class="text-xs font-semibold text-slate-500">狀態</div>
            <select
              v-model="side.status"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="enabled">啟用</option>
              <option value="disabled">停用</option>
              <option value="blocked">封鎖</option>
            </select>

            <input
              v-model="side.statusReason"
              type="text"
              placeholder="狀態變更原因（建議填）"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />

            <button
              type="button"
              class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              :disabled="side.status === member.status"
              @click="applyStatusChange()"
            >
              套用狀態
            </button>
          </div>

          <div class="mt-2 flex w-full flex-col gap-2">
            <div class="text-xs font-semibold text-slate-500">標籤（逗號分隔）</div>
            <input
              v-model="side.tagsText"
              type="text"
              placeholder="例如：VIP, 票券用戶, 需回電"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />

            <div class="flex w-full flex-wrap gap-2">
              <button
                v-for="t in store.presetTags"
                :key="t"
                type="button"
                class="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                @click="appendTag(t)"
              >
                {{ t }}
              </button>
            </div>

            <button
              type="button"
              class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              @click="applyTagsChange()"
            >
              套用標籤
            </button>
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
        >
          <div class="text-sm font-semibold text-slate-900">內部備註</div>

          <textarea
            v-model="side.note"
            rows="5"
            class="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            placeholder="只給客服/管理員看的備註，會員不會看到"
          ></textarea>

          <button
            type="button"
            class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            @click="applyNoteChange()"
          >
            儲存備註
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="member"
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 xl:hidden"
    >
      <div class="text-sm font-semibold text-slate-900">快速設定</div>

      <div class="flex w-full flex-wrap gap-3">
        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">狀態</div>
          <select
            v-model="side.status"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="enabled">啟用</option>
            <option value="disabled">停用</option>
            <option value="blocked">封鎖</option>
          </select>
        </div>

        <div class="flex min-w-55 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">原因</div>
          <input
            v-model="side.statusReason"
            type="text"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <button
          type="button"
          class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          :disabled="side.status === member.status"
          @click="applyStatusChange()"
        >
          套用狀態
        </button>
      </div>

      <div class="flex w-full flex-col gap-1">
        <div class="text-xs font-semibold text-slate-500">標籤（逗號分隔）</div>
        <input
          v-model="side.tagsText"
          type="text"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
        />
      </div>

      <div class="flex w-full flex-wrap gap-2">
        <button
          v-for="t in store.presetTags"
          :key="t"
          type="button"
          class="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          @click="appendTag(t)"
        >
          {{ t }}
        </button>
      </div>

      <div class="flex w-full items-center gap-2">
        <button
          type="button"
          class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          @click="applyTagsChange()"
        >
          套用標籤
        </button>

        <button
          type="button"
          class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          @click="applyNoteChange()"
        >
          儲存備註
        </button>
      </div>

      <textarea
        v-model="side.note"
        rows="4"
        class="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
        placeholder="內部備註"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useAdminMemberStore,
  type MemberLevel,
  type MemberStatus,
  type Member,
} from "@/stores/adminMemberStore";

const router = useRouter();
const route = useRoute();
const store = useAdminMemberStore();

const memberId = computed((): string => String(route.params.id || ""));

const member = computed((): Member | null => {
  return store.getMemberById(memberId.value);
});

const logs = computed(() => {
  if (!member.value) return [];
  return store.getLogsByMember(member.value.id);
});

function initials(name: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "MB";
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return (a + b).toUpperCase() || "MB";
}

function statusText(s: MemberStatus) {
  if (s === "enabled") return "啟用";
  if (s === "disabled") return "停用";
  return "封鎖";
}

function levelText(l: MemberLevel) {
  if (l === "vip") return "VIP";
  if (l === "business") return "企業";
  return "一般";
}

function statusPillClass(s: MemberStatus) {
  if (s === "enabled") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "disabled") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}

function goList() {
  router.push({ name: "MemberList" });
}

const isEditing = ref<boolean>(false);

const edit = reactive<{
  name: string;
  phone: string;
  billingAddress: string;
  level: MemberLevel;
  avatarUrl: string;
  avatarPreviewUrl: string;
}>({
  name: "",
  phone: "",
  billingAddress: "",
  level: "normal",
  avatarUrl: "",
  avatarPreviewUrl: "",
});

const side = reactive<{
  status: MemberStatus;
  statusReason: string;
  tagsText: string;
  note: string;
}>({
  status: "enabled",
  statusReason: "",
  tagsText: "",
  note: "",
});

const avatarBroken = ref<boolean>(false);
const avatarInputRef = ref<HTMLInputElement | null>(null);

const currentAvatarUrl = computed((): string => {
  if (!member.value) return "";
  if (isEditing.value) {
    const preview = String(edit.avatarPreviewUrl || "").trim();
    if (preview) return preview;
    return String(edit.avatarUrl || "").trim();
  }
  return String(member.value.avatarUrl || "").trim();
});

const hasAvatar = computed((): boolean => {
  return !!currentAvatarUrl.value;
});

function onAvatarError() {
  avatarBroken.value = true;
}

watch(
  () => currentAvatarUrl.value,
  () => {
    avatarBroken.value = false;
  }
);

function onAvatarClick() {
  if (!isEditing.value) return;
  const el = avatarInputRef.value;
  if (!el) return;
  el.click();
}

function onAvatarFileChange(e: Event) {
  const input = e.target as HTMLInputElement | null;
  const file = input?.files?.[0] || null;

  if (input) input.value = "";

  if (!file) return;
  if (!file.type || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    edit.avatarPreviewUrl = result;
    avatarBroken.value = false;
  };
  reader.readAsDataURL(file);
}

function fillFromMember() {
  if (!member.value) return;

  edit.name = member.value.name;
  edit.phone = member.value.phone;
  edit.billingAddress = member.value.billingAddress;
  edit.level = member.value.level;

  edit.avatarUrl = String(member.value.avatarUrl || "");
  edit.avatarPreviewUrl = "";

  side.status = member.value.status;
  side.statusReason = "";
  side.tagsText = (member.value.tags || []).join(", ");
  side.note = String(member.value.internalNote || "");

  avatarBroken.value = false;
}

watch(
  () => member.value?.id,
  () => {
    fillFromMember();
    isEditing.value = false;
  },
  { immediate: true }
);

function toggleEdit() {
  if (!member.value) return;
  isEditing.value = !isEditing.value;
  if (!isEditing.value) fillFromMember();
}

function cancelEdit() {
  isEditing.value = false;
  fillFromMember();
}

function nextAvatarForSave() {
  const preview = String(edit.avatarPreviewUrl || "").trim();
  if (preview) return preview;
  return String(edit.avatarUrl || "").trim();
}

const canSave = computed(() => {
  if (!member.value) return false;
  if (!isEditing.value) return false;

  const m = member.value;

  const sameName = String(edit.name || "").trim() === String(m.name || "").trim();
  const samePhone = String(edit.phone || "").trim() === String(m.phone || "").trim();
  const sameAddr =
    String(edit.billingAddress || "").trim() === String(m.billingAddress || "").trim();
  const sameLevel = edit.level === m.level;

  const nextAvatar = nextAvatarForSave();
  const sameAvatar = String(m.avatarUrl || "").trim() === nextAvatar;

  return !(sameName && samePhone && sameAddr && sameLevel && sameAvatar);
});

function save() {
  if (!member.value) return;

  const before = member.value;

  const nextName = String(edit.name || "").trim();
  const nextPhone = String(edit.phone || "").trim();
  const nextAddr = String(edit.billingAddress || "").trim();
  const nextLevel = edit.level;
  const nextAvatar = nextAvatarForSave();

  store.updateMember({
    id: before.id,
    name: nextName,
    phone: nextPhone,
    billingAddress: nextAddr,
    level: nextLevel,
    avatarUrl: nextAvatar,
  });

  const changes: string[] = [];
  if (before.name !== nextName) changes.push(`name "${before.name}" -> "${nextName}"`);
  if (before.phone !== nextPhone) changes.push(`phone "${before.phone}" -> "${nextPhone}"`);
  if (before.billingAddress !== nextAddr) changes.push("billingAddress 更新");
  if (before.level !== nextLevel) changes.push(`level ${before.level} -> ${nextLevel}`);
  if (String(before.avatarUrl || "").trim() !== nextAvatar) changes.push("avatarUrl 更新");

  store.addLog(before.id, "更新資料", changes.length ? changes.join("；") : "更新資料");

  isEditing.value = false;
  fillFromMember();
}

function applyStatusChange() {
  if (!member.value) return;
  const m = member.value;
  const next = side.status;
  if (m.status === next) return;

  store.updateMember({ id: m.id, status: next });
  store.addLog(
    m.id,
    "變更狀態",
    `status ${m.status} -> ${next}${side.statusReason ? `（原因：${side.statusReason}）` : ""}`
  );

  side.statusReason = "";
  fillFromMember();
}

function appendTag(tag: string) {
  const t = String(tag || "").trim();
  if (!t) return;

  const list = String(side.tagsText || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => !!x);

  if (!list.includes(t)) list.push(t);
  side.tagsText = list.join(", ");
}

function applyTagsChange() {
  if (!member.value) return;

  const id = member.value.id;
  const beforeTags = (member.value.tags || []).slice().sort();
  const nextTags = String(side.tagsText || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => !!x)
    .slice(0, 8);

  const nextSorted = nextTags.slice().sort();
  const same = JSON.stringify(beforeTags) === JSON.stringify(nextSorted);
  if (same) return;

  store.updateMember({ id, tags: nextTags });
  store.addLog(
    id,
    "更新標籤",
    `tags ${beforeTags.join("|") || "—"} -> ${nextTags.join("|") || "—"}`
  );

  fillFromMember();
}

function applyNoteChange() {
  if (!member.value) return;

  const id = member.value.id;
  const before = String(member.value.internalNote || "");
  const next = String(side.note || "");

  if (before === next) return;

  store.updateMember({ id, internalNote: next });
  store.addLog(id, "更新內部備註", "更新內部備註內容");

  fillFromMember();
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

function exportOneCsv() {
  if (!member.value) return;
  const csv = store.exportCsv([member.value.id]);
  downloadText(`member_${member.value.id}.csv`, csv);
}

function simulateResendVerify() {
  if (!member.value) return;
  store.addLog(member.value.id, "重寄驗證", "已模擬重寄驗證通知（尚未串接 API）", "客服");
}

function simulateForceLogout() {
  if (!member.value) return;
  store.addLog(member.value.id, "強制登出", "已模擬強制登出（尚未串接 API）", "客服");
}
</script>
