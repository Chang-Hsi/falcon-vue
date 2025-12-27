<template>
  <div class="flex w-full flex-col gap-4">
    <div
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="flex w-full items-start justify-between gap-3">
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="text-[20px] font-extrabold tracking-wide text-slate-900">
            {{ theme?.title || "主題詳情" }}
          </div>
          <div class="text-[13px] text-slate-500">
            {{ theme?.subtitle || "" }}
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
            @click="goBack"
          >
            返回列表
          </button>

          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            :disabled="!theme"
            @click="theme && goEdit(theme.id)"
          >
            編輯
          </button>
        </div>
      </div>

      <div class="flex w-full items-center gap-3">
        <span
          class="rounded-full px-3 py-1 text-[12px] font-semibold"
          :class="
            theme?.status === 'enabled'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
              : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
          "
        >
          {{ theme?.status === "enabled" ? "啟用" : "停用" }}
        </span>

        <div class="text-[12px] text-slate-500">
          更新時間：{{ theme?.updatedAt || "—" }}
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="text-[14px] font-bold text-slate-900">主視覺</div>

      <div class="overflow-hidden rounded-2xl ring-1 ring-slate-100">
        <img
          v-if="theme?.heroImageUrl"
          :src="theme.heroImageUrl"
          :alt="theme.title"
          class="h-56 w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          v-else
          class="flex h-56 w-full items-center justify-center bg-slate-50 text-[12px] text-slate-500"
        >
          尚未設定主視覺圖片
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="flex w-full items-center justify-between">
        <div class="text-[14px] font-bold text-slate-900">卡片</div>
        <div class="text-[12px] text-slate-500">{{ theme?.cards?.length || 0 }} 張</div>
      </div>

      <div class="flex w-full flex-col gap-3">
        <div
          v-for="c in theme?.cards || []"
          :key="c.id"
          class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
        >
          <div class="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
            <img
              v-if="c.imageUrl"
              :src="c.imageUrl"
              :alt="c.name"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="line-clamp-1 text-[13px] font-bold text-slate-900">
              {{ c.name }}
            </div>
            <div class="line-clamp-1 text-[12px] text-slate-500">
              {{ c.category }}
            </div>
            <div class="flex items-center gap-3 text-[12px] text-slate-600">
              <div class="flex items-center gap-1">
                <span class="text-orange-500">★</span>
                <span class="font-semibold">{{ c.rating }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span>◎</span>
                <span>{{ c.distance }}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!(theme?.cards || []).length"
          class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-500"
        >
          尚未設定卡片
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="flex w-full items-center justify-between">
        <div class="text-[14px] font-bold text-slate-900">店家</div>
        <div class="text-[12px] text-slate-500">{{ theme?.stores?.length || 0 }} 筆</div>
      </div>

      <div class="flex w-full flex-col gap-2">
        <div
          v-for="s in theme?.stores || []"
          :key="s.id"
          class="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="line-clamp-1 text-[13px] font-bold text-slate-900">
              {{ s.name }}
            </div>
            <div class="line-clamp-1 text-[12px] text-slate-500">
              {{ s.categoryMain }} / {{ s.categorySub }}
            </div>
          </div>

          <div class="shrink-0 text-[12px] font-semibold text-slate-700">
            {{ s.rating }}
          </div>
        </div>

        <div
          v-if="!(theme?.stores || []).length"
          class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-500"
        >
          尚未設定店家
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdminThemeStore, type AdminTheme } from "@/stores/adminThemeStore";

const route = useRoute();
const router = useRouter();
const store = useAdminThemeStore();

const themeId = computed(() => String(route.params.id || ""));
const theme = computed<AdminTheme | null>(() => store.getThemeById(themeId.value));

function goBack() {
  router.push({ name: "ThemeList" });
}

function goEdit(id: string) {
  router.push({ name: "ThemeEdit", params: { id } });
}
</script>
