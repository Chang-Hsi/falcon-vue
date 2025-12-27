<template>
  <div class="flex min-h-screen w-full flex-col bg-slate-50">
    <div class="flex w-full flex-1 items-center justify-center px-5 py-10">
      <div class="flex w-full max-w-130 flex-col gap-6">
        <div
          class="card w-full bg-white shadow-sm ring-1 ring-slate-200 py-4 rounded-2xl"
        >
          <div class="flex w-full items-center justify-center gap-3">
            <img src="../../assets/logo.png" class="h-25" alt="" />
          </div>
          <div class="card-body gap-5 p-8">
            <div class="flex flex-col gap-2">
              <div class="text-2xl font-extrabold text-slate-900">後台管理系統</div>
              <div class="text-sm text-slate-500">請輸入帳號密碼</div>
            </div>

            <div v-if="errorMsg" class="alert alert-error">
              <span class="text-sm">{{ errorMsg }}</span>
            </div>

            <form class="flex w-full flex-col gap-4" @submit.prevent="onSubmit">
              <div class="flex w-full flex-col gap-2">
                <div class="text-sm font-semibold text-slate-700">帳號</div>
                <input
                  v-model.trim="account"
                  type="text"
                  class="input input-bordered w-full border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
                  placeholder="name@company.com"
                  autocomplete="username"
                />
              </div>

              <div class="flex w-full flex-col gap-2">
                <div class="text-sm font-semibold text-slate-700">密碼</div>
                <input
                  v-model.trim="password"
                  type="password"
                  class="input input-bordered w-full border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>

              <div class="flex w-full items-center justify-between gap-3">
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    v-model="remember"
                    type="checkbox"
                    class="checkbox checkbox-sm"
                  />
                  <span class="text-sm text-slate-700">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                class="btn w-full border-none bg-slate-900 text-white hover:bg-slate-800"
                :disabled="loading"
              >
                <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                <span v-else>登入</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const account = ref<string>("");
const password = ref<string>("");
const remember = ref<boolean>(true);
const loading = ref<boolean>(false);
const errorMsg = ref<string>("");

const year = new Date().getFullYear();

function setAuthed() {
  try {
    localStorage.setItem("admin_auth", "1");
  } catch {}
}

function saveRememberedAccount(val: string, enabled: boolean) {
  try {
    if (!enabled) {
      localStorage.removeItem("admin_account");
      return;
    }
    localStorage.setItem("admin_account", val || "");
  } catch {}
}

function loadRememberedAccount() {
  try {
    const v = localStorage.getItem("admin_account");
    if (v) account.value = v;
  } catch {}
}

async function onSubmit() {
  errorMsg.value = "";
  loading.value = true;

  try {
    const a = String(account.value || "").trim();
    const p = String(password.value || "").trim();

    if (!a || !p) {
      errorMsg.value = "請輸入帳號與密碼";
      return;
    }

    if (a !== "0000" || p !== "0000") {
      errorMsg.value = "帳號或密碼錯誤（示範帳密：0000 / 0000）";
      return;
    }

    setAuthed();
    saveRememberedAccount(a, remember.value);

    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "";
    await router.replace(redirect || "/dashboard");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRememberedAccount();
});
</script>
