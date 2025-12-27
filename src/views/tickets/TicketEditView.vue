<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-center justify-between pt-2">
      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          {{ isEdit ? "編輯票券" : "新增票券" }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn btn-ghost h-10 min-h-10 rounded-xl px-4"
          @click="onDiscard"
        >
          取消
        </button>

        <button
          type="button"
          class="btn h-10 min-h-10 rounded-xl px-4 text-white"
          :class="canSave ? 'btn-primary' : 'btn-disabled'"
          :disabled="!canSave"
          @click="onSave"
        >
          儲存票券
        </button>
      </div>
    </div>

    <div class="flex w-full flex-col gap-4 lg:flex-row">
      <div class="flex w-full flex-1 flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="text-sm font-extrabold text-slate-900">基本資訊</div>

          <div class="flex w-full flex-col gap-3">
            <div v-if="!isEdit" class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">票券 ID（唯一）</div>
              <input
                v-model.trim="form.id"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：subway-xinyi"
                @input="onNormalizeId"
              />
              <div class="text-xs text-slate-500">建議小寫英文/數字（可含 -）</div>
            </div>

            <div v-else class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">票券 ID</div>
              <input
                :value="form.id"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl opacity-70"
                disabled
              />
              <div class="text-xs text-slate-500">編輯模式下不允許修改 ID</div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">票券標題</div>
              <input
                v-model.trim="form.title"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：Subway信義店"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">副標題</div>
              <input
                v-model.trim="form.subtitle"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：PayEasy大吉大利套餐"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">點數</div>
              <input
                v-model.number="form.points"
                type="number"
                min="0"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：350"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">圖片（網址）</div>
              <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  v-model.trim="form.imageUrl"
                  type="text"
                  class="input input-bordered h-10 w-full flex-1 rounded-xl"
                  placeholder="https://..."
                />
                <label class="btn btn-outline h-10 min-h-10 rounded-xl">
                  選擇檔案
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="onPickImageFile"
                  />
                </label>
              </div>

              <div class="flex w-full">
                <div
                  class="mt-2 flex h-40 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <img
                    v-if="imagePreview"
                    :src="imagePreview"
                    class="h-full w-full object-cover"
                    alt="ticket"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center text-sm text-slate-400"
                  >
                    尚未設定圖片
                  </div>
                </div>
              </div>
            </div>

            <div class="flex w-full flex-col gap-2">
              <div class="text-xs font-bold text-slate-600">內容</div>

              <div class="flex w-full flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="btn btn-sm rounded-xl"
                  :class="isBold ? 'btn-neutral' : 'btn-ghost'"
                  @click="cmdBold"
                  :disabled="!editor"
                >
                  粗體
                </button>

                <button
                  type="button"
                  class="btn btn-sm rounded-xl"
                  :class="isItalic ? 'btn-neutral' : 'btn-ghost'"
                  @click="cmdItalic"
                  :disabled="!editor"
                >
                  斜體
                </button>

                <button
                  type="button"
                  class="btn btn-sm rounded-xl"
                  :class="isOrdered ? 'btn-neutral' : 'btn-ghost'"
                  @click="cmdOrdered"
                  :disabled="!editor"
                >
                  編號
                </button>

                <div class="flex flex-1 items-center gap-2">
                  <input
                    v-model.trim="linkDraft"
                    type="text"
                    class="input input-bordered input-sm h-9 w-full min-w-48 rounded-xl"
                    placeholder="貼上連結後按套用"
                    :disabled="!editor"
                  />
                  <button
                    type="button"
                    class="btn btn-sm rounded-xl"
                    @click="cmdSetLink"
                    :disabled="!editor"
                  >
                    套用連結
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm rounded-xl"
                    @click="cmdUnsetLink"
                    :disabled="!editor"
                  >
                    移除連結
                  </button>
                </div>
              </div>

              <div class="flex w-full rounded-2xl border border-slate-200 bg-white p-3">
                <EditorContent v-if="editor" :editor1="editor" class="w-full" />
              </div>
            </div>

            <div
              v-if="errorMsg"
              class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {{ errorMsg }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full max-w-full flex-col gap-4 lg:w-90 lg:max-w-90">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="text-sm font-extrabold text-slate-900">設定</div>

          <div class="flex w-full flex-col gap-3">
            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">狀態</div>
              <select
                v-model="form.status"
                class="select select-bordered h-10 w-full rounded-xl"
              >
                <option value="draft">草稿</option>
                <option value="enabled">上架</option>
                <option value="disabled">下架</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">所屬品牌</div>
              <select
                v-model="form.brandId"
                class="select select-bordered h-10 w-full rounded-xl"
              >
                <option value="">未指定</option>
                <option v-for="b in brandOptions" :key="b.id" :value="b.id">
                  {{ b.name }}（{{ b.id }}）
                </option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">庫存</div>
              <input
                v-model.number="form.stock"
                type="number"
                min="0"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：100"
              />
              <div class="text-xs text-slate-500">0 表示不限量或尚未設定</div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">有效日期（起）</div>
              <input
                v-model.trim="form.validFrom"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：2024/08/21"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">有效日期（迄）</div>
              <input
                v-model.trim="form.validTo"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：2024/12/31"
              />
            </div>
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="text-xs font-bold text-slate-600">更新時間</div>
          <div class="text-sm font-semibold text-slate-900">{{ form.updatedAt }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Editor as VueEditor, EditorContent } from "@tiptap/vue-3";
import type { Editor as CoreEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import { useAdminTicketStore } from "@/stores/adminTicketStore";
import { useAdminBrandStore } from "@/stores/adminBrandStore";

type TicketStatus = "draft" | "enabled" | "disabled";
type Category = { id: string; label: string };

const route = useRoute();
const router = useRouter();

const ticketStore = useAdminTicketStore();
const brandStore = useAdminBrandStore();

const errorMsg = ref<string>("");
const categorySearch = ref<string>("");
const linkDraft = ref<string>("");

const ticketId = computed<string>(() => String(route.params.id || ""));
const isEdit = computed<boolean>(() => Boolean(ticketId.value));

/**
 * ✅ 這裡用 CoreEditor 型別，解掉 EditorContent 的 TS 型別衝突
 *（根本解法仍然是把 @tiptap/* 版本統一）
 */
const editor = ref<CoreEditor | null>(null);

const form = reactive<{
  id: string;
  title: string;
  subtitle: string;
  points: number;
  imageUrl: string;

  brandId: string;
  categoryIds: string[];

  status: TicketStatus;
  stock: number;

  validFrom: string;
  validTo: string;

  htmlContent: string;
  updatedAt: string;
}>({
  id: "",
  title: "",
  subtitle: "",
  points: 0,
  imageUrl: "",

  brandId: "",
  categoryIds: [],

  status: "draft",
  stock: 0,

  validFrom: "",
  validTo: "",

  htmlContent: "",
  updatedAt: new Date().toISOString().slice(0, 10),
});

const imagePreview = computed<string>(() => form.imageUrl || "");

const categories = computed<Category[]>(() => {
  const list = ticketStore.categories;
  return Array.isArray(list) ? list : [];
});

const filteredCategories = computed<Category[]>(() => {
  const q = categorySearch.value.trim().toLowerCase();
  if (!q) return categories.value;
  return categories.value.filter(
    (c) => c.id.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)
  );
});

const brandOptions = computed(() => {
  const list = brandStore.items;
  if (!Array.isArray(list)) return [];
  return list.map((b) => ({ id: b.id, name: b.name }));
});

function categoryLabel(id: string) {
  const map = ticketStore.categoryLabelMap;
  return map?.[id] || id;
}

function toggleCategory(id: string) {
  const idx = form.categoryIds.indexOf(id);
  if (idx >= 0) form.categoryIds.splice(idx, 1);
  else form.categoryIds.push(id);
}

function removeCategory(id: string) {
  const idx = form.categoryIds.indexOf(id);
  if (idx >= 0) form.categoryIds.splice(idx, 1);
}

function onNormalizeId() {
  form.id = String(form.id || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read file error"));
    reader.readAsDataURL(file);
  });
}

async function onPickImageFile(e: Event) {
  const input = e.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;

  try {
    const url = await readFileAsDataUrl(file);
    form.imageUrl = url;
  } catch {
    errorMsg.value = "圖片讀取失敗，請改用網址或換一張圖片";
  } finally {
    if (input) input.value = "";
  }
}

function canParseDateLike(s: string) {
  const t = String(s || "").trim();
  if (!t) return true;
  return /^(\d{4})[\/-](\d{2})[\/-](\d{2})$/.test(t);
}

const canSave = computed<boolean>(() => {
  if (!String(form.title || "").trim()) return false;
  if (!String(form.subtitle || "").trim()) return false;
  if (!Number.isFinite(Number(form.points)) || Number(form.points) <= 0) return false;
  if (!String(form.imageUrl || "").trim()) return false;

  if (!isEdit.value) {
    if (!String(form.id || "").trim()) return false;
  }

  if (!canParseDateLike(form.validFrom)) return false;
  if (!canParseDateLike(form.validTo)) return false;

  return true;
});

function onDiscard() {
  router.push("/tickets");
}

function existsSameId(id: string) {
  const items = ticketStore.items;
  if (!Array.isArray(items)) return false;
  return items.some((x) => String((x as any)?.id) === String(id));
}

function fillFromTicket(t: any) {
  form.id = String(t?.id || "");
  form.title = String(t?.title || "");
  form.subtitle = String(t?.subtitle || "");
  form.points = Number(t?.points || 0);
  form.imageUrl = String(t?.imageUrl || "");

  form.brandId = String(t?.brandId || "");
  form.categoryIds = Array.isArray(t?.categoryIds) ? t.categoryIds.slice() : [];

  form.status = (t?.status as TicketStatus) || "draft";
  form.stock = Number(t?.stock || 0);

  form.validFrom = String(t?.validFrom || "");
  form.validTo = String(t?.validTo || "");

  form.htmlContent = String(t?.htmlContent || "");
  form.updatedAt = String(t?.updatedAt || form.updatedAt);
}

function initEditor() {
  if (editor.value) return;

  const instance = new VueEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder: "輸入票券內容（可用粗體、斜體、編號、連結）…",
      }),
    ],
    content: form.htmlContent || "",
    editorProps: {
      attributes: {
        class: "w-full min-h-[220px] outline-none text-slate-800",
      },
    },
    onUpdate: ({ editor: ed }) => {
      form.htmlContent = ed.getHTML();
    },
  });

  editor.value = (instance as unknown) as CoreEditor;
}

onMounted(() => {
  if (isEdit.value) {
    const t = ticketStore.getById(ticketId.value);
    if (!t) {
      errorMsg.value = "找不到此票券，可能已被刪除";
    } else {
      fillFromTicket(t);
    }
  }

  initEditor();

  if (editor.value) {
    editor.value.commands.setContent(form.htmlContent || "", { emitUpdate: false });
  }
});

watch(
  () => ticketId.value,
  () => {
    if (!isEdit.value) return;

    const t = ticketStore.getById(ticketId.value);
    if (!t) {
      errorMsg.value = "找不到此票券，可能已被刪除";
      return;
    }

    errorMsg.value = "";
    fillFromTicket(t);

    if (editor.value) {
      editor.value.commands.setContent(form.htmlContent || "", { emitUpdate: false });
    }
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
  editor.value = null;
});

const isBold = computed<boolean>(() => !!editor.value?.isActive("bold"));
const isItalic = computed<boolean>(() => !!editor.value?.isActive("italic"));
const isOrdered = computed<boolean>(() => !!editor.value?.isActive("orderedList"));

function cmdBold() {
  editor.value?.chain().focus().toggleBold().run();
}
function cmdItalic() {
  editor.value?.chain().focus().toggleItalic().run();
}
function cmdOrdered() {
  editor.value?.chain().focus().toggleOrderedList().run();
}
function cmdSetLink() {
  const url = String(linkDraft.value || "").trim();
  if (!url) return;
  editor.value?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}
function cmdUnsetLink() {
  editor.value?.chain().focus().unsetLink().run();
}

async function onSave() {
  errorMsg.value = "";

  const title = String(form.title || "").trim();
  const subtitle = String(form.subtitle || "").trim();
  const imageUrl = String(form.imageUrl || "").trim();
  const points = Number(form.points || 0);

  if (!title || !subtitle || !imageUrl || !Number.isFinite(points) || points <= 0) {
    errorMsg.value = "請先填完：標題 / 副標題 / 點數（>0）/ 圖片";
    return;
  }

  if (!isEdit.value) {
    const id = String(form.id || "").trim();
    if (!id) {
      errorMsg.value = "請先填寫票券 ID";
      return;
    }
    if (existsSameId(id)) {
      errorMsg.value = "票券 ID 已存在，請更換一個 ID";
      return;
    }
  }

  if (!canParseDateLike(form.validFrom) || !canParseDateLike(form.validTo)) {
    errorMsg.value = "日期格式請用：YYYY/MM/DD 或 YYYY-MM-DD";
    return;
  }

  const now = new Date();
  const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(
    2,
    "0"
  )}:${String(now.getMinutes()).padStart(2, "0")}`;

  const payload = {
    id: isEdit.value ? ticketId.value : String(form.id || "").trim(),
    title,
    subtitle,
    points,
    imageUrl,
    brandId: String(form.brandId || ""),
    categoryIds: Array.isArray(form.categoryIds) ? form.categoryIds : [],
    status: form.status,
    stock: Number.isFinite(Number(form.stock)) ? Number(form.stock) : 0,
    validFrom: String(form.validFrom || ""),
    validTo: String(form.validTo || ""),
    htmlContent: String(form.htmlContent || ""),
    updatedAt,
  };

  try {
    ticketStore.upsertTicket(payload);
    router.push(`/tickets/${payload.id}/edit`);
  } catch (e) {
    errorMsg.value = "儲存失敗，請稍後再試";
    console.error(e);
  }
}
</script>

<style scoped>
:deep(.ProseMirror) {
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.ProseMirror:focus) {
  outline: none;
}

:deep(.ProseMirror a) {
  text-decoration: underline;
}

:deep(.ProseMirror ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}

:deep(.ProseMirror ol li) {
  margin: 0.125rem 0;
}
</style>
