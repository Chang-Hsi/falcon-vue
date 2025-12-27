<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-center justify-between pt-2">
      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          {{ isEditMode ? "編輯店家" : "新增店家" }}
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
          儲存店家
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
            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">店家名稱</div>
              <input
                v-model.trim="form.name"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：85度C 南京東路店"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">
                店家 ID（建議英文/數字/短字）
              </div>
              <input
                v-model.trim="form.id"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：s5"
                @input="onNormalizeId"
                :disabled="isEditMode"
              />
              <div class="text-xs text-slate-500">
                建議：建立後不要變更 ID，避免資料關聯與路由失效
              </div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">封面（Cover，網址）</div>
              <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  v-model.trim="form.coverUrl"
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
                    @change="onPickCoverFile"
                  />
                </label>
              </div>

              <div class="flex w-full">
                <div
                  class="mt-2 flex h-44 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <img
                    v-if="coverPreview"
                    :src="coverPreview"
                    class="h-full w-full object-cover"
                    alt="cover"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center text-sm text-slate-400"
                  >
                    尚未設定封面
                  </div>
                </div>
              </div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">主圖（Image，網址）</div>
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
              <div class="text-xs text-slate-500">
                店家詳情頁用的主圖；沒有也可先用封面
              </div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">優惠標籤（Badge）</div>
              <input
                v-model.trim="form.badge"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：指定商品買一送一"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">評分</div>
              <input
                v-model.number="form.rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="0 ~ 5"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">距離（顯示文字）</div>
              <input
                v-model.trim="form.distanceText"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：0.5km"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">營業時間</div>
              <input
                v-model.trim="form.hoursText"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：週一至週日 11:00-22:00"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">電話</div>
              <input
                v-model.trim="form.phone"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：02-2345-6789"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">地址</div>
              <input
                v-model.trim="form.addressText"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：台北市信義區信義路五段7號"
              />
            </div>

            <div
              v-if="errorMsg"
              class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {{ errorMsg }}
            </div>
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="text-sm font-extrabold text-slate-900">店家介紹 / 使用規範</div>

          <div class="flex w-full flex-col gap-4">
            <div class="flex w-full flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="text-xs font-bold text-slate-600">介紹內容</div>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="introEditor?.isActive('bold') ? 'btn-neutral' : 'btn-ghost'"
                    @click="toggleBold(introEditor)"
                  >
                    粗體
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="introEditor?.isActive('italic') ? 'btn-neutral' : 'btn-ghost'"
                    @click="toggleItalic(introEditor)"
                  >
                    斜體
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="
                      introEditor?.isActive('bulletList') ? 'btn-neutral' : 'btn-ghost'
                    "
                    @click="toggleBulletList(introEditor)"
                  >
                    列點
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="
                      introEditor?.isActive('orderedList') ? 'btn-neutral' : 'btn-ghost'
                    "
                    @click="toggleOrderedList(introEditor)"
                  >
                    編號
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="introEditor?.isActive('link') ? 'btn-neutral' : 'btn-ghost'"
                    @click="setLink(introEditor)"
                  >
                    連結
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    @click="unsetLink(introEditor)"
                  >
                    移除連結
                  </button>
                </div>
              </div>

              <div class="rounded-xl border border-slate-200 bg-white">
                <EditorContent :editor="introEditor" />
              </div>
            </div>

            <div class="flex w-full flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="text-xs font-bold text-slate-600">使用規範</div>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="rulesEditor?.isActive('bold') ? 'btn-neutral' : 'btn-ghost'"
                    @click="toggleBold(rulesEditor)"
                  >
                    粗體
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="rulesEditor?.isActive('italic') ? 'btn-neutral' : 'btn-ghost'"
                    @click="toggleItalic(rulesEditor)"
                  >
                    斜體
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="
                      rulesEditor?.isActive('bulletList') ? 'btn-neutral' : 'btn-ghost'
                    "
                    @click="toggleBulletList(rulesEditor)"
                  >
                    列點
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="
                      rulesEditor?.isActive('orderedList') ? 'btn-neutral' : 'btn-ghost'
                    "
                    @click="toggleOrderedList(rulesEditor)"
                  >
                    編號
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    :class="rulesEditor?.isActive('link') ? 'btn-neutral' : 'btn-ghost'"
                    @click="setLink(rulesEditor)"
                  >
                    連結
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm h-8 min-h-8 rounded-lg"
                    @click="unsetLink(rulesEditor)"
                  >
                    移除連結
                  </button>
                </div>
              </div>

              <div class="rounded-xl border border-slate-200 bg-white">
                <EditorContent :editor="rulesEditor" />
              </div>

              <div
                class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
              >
                提醒：要插入「編號/列點」，先點一下編輯區讓游標在裡面再按按鈕
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full max-w-full flex-col gap-4 lg:w-90 lg:max-w-90">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="text-sm font-extrabold text-slate-900">分類 / 設定</div>

          <div class="flex w-full flex-col gap-3">
            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">狀態</div>
              <select
                v-model="form.status"
                class="select select-bordered h-10 w-full rounded-xl"
              >
                <option value="enabled">上架</option>
                <option value="disabled">下架</option>
              </select>
            </div>

            <div
              class="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
            >
              <div class="flex flex-col">
                <div class="text-sm font-bold text-slate-900">精選店家</div>
                <div class="text-xs text-slate-500">前台首頁可優先曝光</div>
              </div>
              <input
                v-model="form.isFeatured"
                type="checkbox"
                class="toggle toggle-primary"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">主分類</div>
              <select
                v-model="form.categoryMainId"
                class="select select-bordered h-10 w-full rounded-xl"
                @change="onMainChanged"
              >
                <option value="">請選擇</option>
                <option v-for="c in store.categoryMain" :key="c.id" :value="c.id">
                  {{ c.label }}
                </option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">子分類</div>
              <select
                v-model="form.categorySubId"
                class="select select-bordered h-10 w-full rounded-xl"
                :disabled="!form.categoryMainId"
              >
                <option value="">請選擇</option>
                <option v-for="c in subOptions" :key="c.id" :value="c.id">
                  {{ c.label }}
                </option>
              </select>
            </div>

            <div
              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
            >
              優惠數 / 票券數之後可改由後端統計回填；目前先用假資料顯示在列表
            </div>
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="text-xs font-bold text-slate-600">更新時間</div>
          <div class="text-sm font-semibold text-slate-900">{{ updatedAtText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdminDealStore, type DealStatus } from "@/stores/adminDealStore";

import { EditorContent, useEditor, type Editor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

const router = useRouter();
const route = useRoute();
const store = useAdminDealStore();

const errorMsg = ref<string>("");

const routeId = computed(() => String(route.params.id || "").trim());
const isEditMode = computed(() => !!routeId.value);

const originalId = ref<string>("");

const updatedAtText = computed(() => {
  return form.updatedAt || new Date().toISOString().slice(0, 16).replace("T", " ");
});

const form = reactive<{
  id: string;
  name: string;

  status: DealStatus;
  isFeatured: boolean;

  categoryMainId: string;
  categorySubId: string;

  rating: number;
  distanceText: string;
  badge: string;

  coverUrl: string;
  imageUrl: string;

  hoursText: string;
  phone: string;
  addressText: string;

  updatedAt: string;
}>({
  id: "",
  name: "",

  status: "enabled",
  isFeatured: false,

  categoryMainId: "",
  categorySubId: "",

  rating: 0,
  distanceText: "",
  badge: "",

  coverUrl: "",
  imageUrl: "",

  hoursText: "",
  phone: "",
  addressText: "",

  updatedAt: "",
});

const coverPreview = computed(() => form.coverUrl || "");

const subOptions = computed(() => {
  if (!form.categoryMainId) return [];
  return store.subOptions(form.categoryMainId);
});

function onMainChanged() {
  form.categorySubId = "";
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

async function onPickCoverFile(e: Event) {
  const input = e.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;

  try {
    const url = await readFileAsDataUrl(file);
    form.coverUrl = url;
  } catch {
    errorMsg.value = "封面讀取失敗，請改用網址或換一張圖片";
  } finally {
    if (input) input.value = "";
  }
}

async function onPickImageFile(e: Event) {
  const input = e.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;

  try {
    const url = await readFileAsDataUrl(file);
    form.imageUrl = url;
  } catch {
    errorMsg.value = "主圖讀取失敗，請改用網址或換一張圖片";
  } finally {
    if (input) input.value = "";
  }
}

function makeParagraphsHtml(paragraphs: string[]) {
  const safe = Array.isArray(paragraphs) ? paragraphs : [];
  if (!safe.length) return "";
  return safe
    .map((t) => `<p>${escapeHtml(String(t || "").trim())}</p>`)
    .join("");
}

function makeBulletListHtml(items: string[]) {
  const safe = Array.isArray(items) ? items : [];
  if (!safe.length) return "";
  const li = safe.map((t) => `<li>${escapeHtml(String(t || "").trim())}</li>`).join("");
  return `<ul>${li}</ul>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlToLines(html: string) {
  const doc = new DOMParser().parseFromString(String(html || ""), "text/html");

  const listItems = Array.from(doc.querySelectorAll("li"))
    .map((el) => (el.textContent || "").trim())
    .filter(Boolean);

  if (listItems.length) return listItems;

  const paras = Array.from(doc.querySelectorAll("p"))
    .map((el) => (el.textContent || "").trim())
    .filter(Boolean);

  if (paras.length) return paras;

  const text = (doc.body?.textContent || "").trim();
  return text ? [text] : [];
}

const introEditor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      protocols: ["http", "https", "mailto", "tel"],
    }),
    Placeholder.configure({
      placeholder: "輸入店家介紹…（可用編號/列點/連結）",
    }),
  ],
  content: "",
});

const rulesEditor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      protocols: ["http", "https", "mailto", "tel"],
    }),
    Placeholder.configure({
      placeholder: "輸入使用規範…（建議用列點或編號）",
    }),
  ],
  content: "",
});

function toggleBold(ed: Editor | null | undefined) {
  if (!ed) return;
  ed.chain().focus().toggleBold().run();
}

function toggleItalic(ed: Editor | null | undefined) {
  if (!ed) return;
  ed.chain().focus().toggleItalic().run();
}

function toggleBulletList(ed: Editor | null | undefined) {
  if (!ed) return;
  ed.chain().focus().toggleBulletList().run();
}

function toggleOrderedList(ed: Editor | null | undefined) {
  if (!ed) return;
  ed.chain().focus().toggleOrderedList().run();
}

function setLink(ed: Editor | null | undefined) {
  if (!ed) return;

  const prev = ed.getAttributes("link")?.href as string | undefined;
  const url = window.prompt("貼上連結（https://...）", prev || "");

  if (url === null) return;

  const u = String(url || "").trim();
  if (!u) {
    ed.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  ed.chain().focus().extendMarkRange("link").setLink({ href: u }).run();
}

function unsetLink(ed: Editor | null | undefined) {
  if (!ed) return;
  ed.chain().focus().extendMarkRange("link").unsetLink().run();
}

function fillFromStore(id: string) {
  const found = store.getById(id);
  if (!found) {
    errorMsg.value = "找不到此店家，將返回列表";
    setTimeout(() => router.push("/deals"), 300);
    return;
  }

  originalId.value = found.id;

  form.id = found.id;
  form.name = found.name;

  form.status = found.status;
  form.isFeatured = found.isFeatured;

  form.categoryMainId = found.categoryMainId;
  form.categorySubId = found.categorySubId;

  form.rating = Number(found.rating) || 0;
  form.distanceText = found.distanceText || "";
  form.badge = found.badge || "";

  form.coverUrl = found.coverUrl || "";
  form.imageUrl = found.imageUrl || found.coverUrl || "";

  form.hoursText = found.hoursText || "";
  form.phone = found.phone || "";
  form.addressText = found.addressText || "";

  form.updatedAt = found.updatedAt || "";

  const introHtml = makeParagraphsHtml(found.introParagraphs || []);
  const rulesHtml = makeBulletListHtml(found.rules || []);

introEditor.value?.commands.setContent(introHtml || "", { emitUpdate: false });
rulesEditor.value?.commands.setContent(rulesHtml || "", { emitUpdate: false });
}

function resetFormForCreate() {
  originalId.value = "";

  form.id = "";
  form.name = "";

  form.status = "enabled";
  form.isFeatured = false;

  form.categoryMainId = "";
  form.categorySubId = "";

  form.rating = 0;
  form.distanceText = "";
  form.badge = "";

  form.coverUrl = "";
  form.imageUrl = "";

  form.hoursText = "";
  form.phone = "";
  form.addressText = "";

  form.updatedAt = "";

  introEditor.value?.commands.setContent("", false);
  rulesEditor.value?.commands.setContent("", false);
}

watch(
  () => routeId.value,
  (id) => {
    errorMsg.value = "";
    if (id) fillFromStore(id);
    else resetFormForCreate();
  }
);

onMounted(() => {
  if (routeId.value) fillFromStore(routeId.value);
  else resetFormForCreate();
});

onBeforeUnmount(() => {
  introEditor.value?.destroy();
  rulesEditor.value?.destroy();
});

const canSave = computed(() => {
  if (!String(form.name || "").trim()) return false;
  if (!String(form.id || "").trim()) return false;
  if (!String(form.coverUrl || "").trim()) return false;
  if (!String(form.categoryMainId || "").trim()) return false;
  if (!String(form.categorySubId || "").trim()) return false;
  return true;
});

function onDiscard() {
  router.push("/deals");
}

function existsSameId(id: string) {
  const items = store.items;
  if (!Array.isArray(items)) return false;

  const target = String(id || "");
  return items.some((x) => {
    if (!x) return false;
    if (originalId.value && x.id === originalId.value) return false;
    return String(x.id) === target;
  });
}

async function onSave() {
  errorMsg.value = "";

  const id = String(form.id || "").trim();
  const name = String(form.name || "").trim();

  if (!id || !name) {
    errorMsg.value = "請先填完：店家名稱 / 店家 ID";
    return;
  }

  if (!isEditMode.value && existsSameId(id)) {
    errorMsg.value = "店家 ID 已存在，請更換一個 ID";
    return;
  }

  const introHtml = introEditor.value?.getHTML() || "";
  const rulesHtml = rulesEditor.value?.getHTML() || "";

  const introParagraphs = htmlToLines(introHtml);
  const rules = htmlToLines(rulesHtml);

  const nowText = new Date().toISOString().slice(0, 16).replace("T", " ");

  const payload = {
    id,
    name,

    status: form.status,
    isFeatured: form.isFeatured,

    categoryMainId: form.categoryMainId,
    categorySubId: form.categorySubId,

    rating: Number(form.rating) || 0,
    distanceText: String(form.distanceText || ""),
    badge: String(form.badge || ""),

    coverUrl: String(form.coverUrl || ""),
    imageUrl: String(form.imageUrl || form.coverUrl || ""),

    hoursText: String(form.hoursText || ""),
    phone: String(form.phone || ""),
    addressText: String(form.addressText || ""),

    introParagraphs,
    rules,

    updatedAt: nowText,
  };

  try {
    store.upsertDeal(payload);
    router.push(`/deals/${id}/edit`);
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

/* ✅ Tailwind preflight 會把 ol/ul list-style 清掉，所以要自己補回來 */
:deep(.ProseMirror ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}

:deep(.ProseMirror ol li) {
  margin: 0.125rem 0;
}

/* ✅ 補上 ul 的圓點 */
:deep(.ProseMirror ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}

:deep(.ProseMirror ul li) {
  margin: 0.125rem 0;
}

/* （可選）第二層清單換成空心圓更好辨識 */
:deep(.ProseMirror ul ul) {
  list-style: circle;
}
</style>
