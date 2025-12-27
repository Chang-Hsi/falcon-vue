<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-center justify-between pt-2">
      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          新增品牌
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
          儲存品牌
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
              <div class="text-xs font-bold text-slate-600">品牌名稱</div>
              <input
                v-model.trim="form.name"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：星巴克"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">
                品牌 ID（建議英文/數字/短字）
              </div>
              <input
                v-model.trim="form.id"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：starbucks"
                @input="onNormalizeId"
              />
              <div class="text-xs text-slate-500">
                用於路由與資料關聯（例：/brand/:id）
              </div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">Logo（網址）</div>
              <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  v-model.trim="form.logoUrl"
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
                    @change="onPickLogoFile"
                  />
                </label>
              </div>

              <div class="flex w-full items-center gap-3">
                <div
                  class="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <img
                    v-if="logoPreview"
                    :src="logoPreview"
                    class="h-full w-full object-cover"
                    alt="logo"
                  />
                </div>
                <div class="text-xs text-slate-500">
                  建議 1:1 或接近方形，列表顯示會更好看
                </div>
              </div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-600">
                品牌主視覺（Cover，網址）
              </div>
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
                    尚未設定主視覺
                  </div>
                </div>
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
                <div class="text-sm font-bold text-slate-900">精選品牌</div>
                <div class="text-xs text-slate-500">前台首頁可優先曝光</div>
              </div>
              <input
                v-model="form.isFeatured"
                type="checkbox"
                class="toggle toggle-primary"
              />
            </div>

            <div class="flex w-full flex-col gap-2">
              <div class="text-xs font-bold text-slate-600">分類（可多選）</div>

              <div
                class="flex w-full flex-col gap-2 rounded-xl border border-slate-200 p-3"
              >
                <div class="flex w-full items-center gap-2">
                  <input
                    v-model.trim="categorySearch"
                    type="text"
                    class="input input-bordered input-sm h-9 w-full rounded-xl"
                    placeholder="搜尋分類"
                  />
                </div>

                <div
                  class="flex w-full flex-col gap-2"
                  style="max-height: 275px; overflow: auto"
                >
                  <label
                    v-for="c in filteredCategories"
                    :key="c.id"
                    class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50"
                  >
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        class="checkbox checkbox-sm"
                        :checked="form.categoryIds.includes(c.id)"
                        @change="toggleCategory(c.id)"
                      />
                      <div class="text-sm font-semibold text-slate-800">
                        {{ c.label }}
                      </div>
                    </div>
                    <div class="text-xs text-slate-400">{{ c.id }}</div>
                  </label>

                  <div
                    v-if="!filteredCategories.length"
                    class="py-6 text-center text-sm text-slate-400"
                  >
                    沒有符合的分類
                  </div>
                </div>

                <div class="flex w-full flex-wrap gap-2 pt-2">
                  <span
                    v-for="cid in form.categoryIds"
                    :key="cid"
                    class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    {{ categoryLabel(cid) }}
                    <button
                      type="button"
                      class="rounded-full px-1 hover:bg-slate-200"
                      @click="removeCategory(cid)"
                    >
                      ×
                    </button>
                  </span>

                  <span v-if="!form.categoryIds.length" class="text-xs text-slate-400">
                    尚未選擇分類
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAdminBrandStore } from "@/stores/adminBrandStore";

type BrandStatus = "enabled" | "disabled";
type Category = { id: string; label: string };

const router = useRouter();
const store = useAdminBrandStore();

const today = new Date().toISOString().slice(0, 10);

const errorMsg = ref<string>("");
const categorySearch = ref<string>("");

const form = reactive<{
  id: string;
  name: string;
  logoUrl: string;
  coverUrl: string;
  status: BrandStatus;
  isFeatured: boolean;
  categoryIds: string[];
}>({
  id: "",
  name: "",
  logoUrl: "",
  coverUrl: "",
  status: "enabled",
  isFeatured: false,
  categoryIds: [],
});

const logoPreview = computed<string>(() => form.logoUrl || "");
const coverPreview = computed<string>(() => form.coverUrl || "");

const categories = computed<Category[]>(() => {
  const list = store.categories;
  return Array.isArray(list) ? list : [];
});

const filteredCategories = computed<Category[]>(() => {
  const q = categorySearch.value.trim().toLowerCase();
  if (!q) return categories.value;

  return categories.value.filter((c) => {
    return c.id.toLowerCase().includes(q) || c.label.toLowerCase().includes(q);
  });
});

function categoryLabel(id: string) {
  return store.categoryLabelMap?.[id] || id;
}

function toggleCategory(id: string) {
  const idx = form.categoryIds.indexOf(id);
  if (idx >= 0) {
    form.categoryIds.splice(idx, 1);
    return;
  }
  form.categoryIds.push(id);
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

async function onPickLogoFile(e: Event) {
  const input = e.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;

  try {
    const url = await readFileAsDataUrl(file);
    form.logoUrl = url;
  } catch {
    errorMsg.value = "Logo 讀取失敗，請改用網址或換一張圖片";
  } finally {
    if (input) input.value = "";
  }
}

async function onPickCoverFile(e: Event) {
  const input = e.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;

  try {
    const url = await readFileAsDataUrl(file);
    form.coverUrl = url;
  } catch {
    errorMsg.value = "Cover 讀取失敗，請改用網址或換一張圖片";
  } finally {
    if (input) input.value = "";
  }
}

function seededNumber(seed: string, min: number, max: number) {
  const s = String(seed || "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const r = Math.abs(h % 100000) / 100000;
  const n = Math.floor(r * (max - min + 1)) + min;
  return n;
}

const statsPreview = computed(() => {
  const id = String(form.id || "");
  const base = id || "new-brand";
  return {
    storeCount: seededNumber(base + "_store", 0, 8),
    dealCount: seededNumber(base + "_deal", 0, 12),
    ticketCount: seededNumber(base + "_ticket", 0, 10),
    subscriberCount: seededNumber(base + "_sub", 0, 50000),
    orderCount30d: seededNumber(base + "_order", 0, 15000),
  };
});

const canSave = computed(() => {
  if (!String(form.id || "").trim()) return false;
  if (!String(form.name || "").trim()) return false;
  if (!String(form.logoUrl || "").trim()) return false;
  return true;
});

function onDiscard() {
  router.push("/brands");
}

function existsSameId(id: string) {
  const items = store.items;
  return Array.isArray(items) ? items.some((x) => String(x?.id) === String(id)) : false;
}

async function onSave() {
  errorMsg.value = "";

  const id = String(form.id || "").trim();
  const name = String(form.name || "").trim();
  const logoUrl = String(form.logoUrl || "").trim();

  if (!id || !name || !logoUrl) {
    errorMsg.value = "請先填完：品牌名稱 / 品牌 ID / Logo";
    return;
  }

  if (existsSameId(id)) {
    errorMsg.value = "品牌 ID 已存在，請更換一個 ID";
    return;
  }

  const payload = {
    id,
    name,
    logoUrl,
    status: form.status,
    isFeatured: form.isFeatured,
    categoryIds: Array.isArray(form.categoryIds) ? form.categoryIds : [],
    updatedAt: today,
    stats: {
      ...statsPreview.value,
    },
  };

  try {
    store.upsertBrand(payload);
    router.push(`/brands/${id}/edit`);
  } catch (e) {
    errorMsg.value = "儲存失敗，請稍後再試";
    console.error(e);
  }
}
</script>

<style scoped>
.prose :deep(a) {
  text-decoration: underline;
}
.prose :deep(ul),
.prose :deep(ol) {
  padding-left: 1.25rem;
}
</style>
