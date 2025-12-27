// src/stores/authStore.ts
import { defineStore } from "pinia";

const LS_AUTH_KEY = "tailadmin_auth";
const LS_USER_KEY = "tailadmin_user";

export type AuthPermission = {
  key: string;
  name: string;
};

export type AuthModule = {
  key: string;
  name: string;
  permissions: AuthPermission[];
};

export type AuthRole = {
  id: string;
  name: string;
  desc: string;
  color: string;
};

export type AuthUser = {
  id: string;
  name: string;
  roleTitle: string;
  avatarUrl: string;
};

export type GrantsMap = Record<string, string[]>;

export type PermissionFlat = {
  moduleKey: string;
  moduleName: string;
  key: string;
  name: string;
};

type AuthState = {
  isLoggedIn: boolean;
  currentUser: AuthUser;
  roles: AuthRole[];
  modules: AuthModule[];
  grants: GrantsMap;
};

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function cloneGrants(grants: GrantsMap): GrantsMap {
  const out: GrantsMap = {};
  Object.keys(grants || {}).forEach((roleId) => {
    out[roleId] = Array.isArray(grants[roleId]) ? [...grants[roleId]] : [];
  });
  return out;
}

function readAuthedFromLocalStorage(): boolean {
  try {
    return localStorage.getItem(LS_AUTH_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function readUserFromLocalStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthUser> | null;
    if (!parsed || typeof parsed !== "object") return null;

    const id = typeof parsed.id === "string" ? parsed.id : "";
    const name = typeof parsed.name === "string" ? parsed.name : "";
    const roleTitle = typeof parsed.roleTitle === "string" ? parsed.roleTitle : "";
    const avatarUrl = typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : "";

    if (!id || !name) return null;

    return { id, name, roleTitle, avatarUrl };
  } catch (e) {
    return null;
  }
}

function saveAuthedToLocalStorage(enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(LS_AUTH_KEY, "1");
    else localStorage.removeItem(LS_AUTH_KEY);
  } catch (e) {}
}

function saveUserToLocalStorage(user: AuthUser | null) {
  try {
    if (!user) localStorage.removeItem(LS_USER_KEY);
    else localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  } catch (e) {}
}

export const useAuthStore = defineStore("authStore", {
  state: (): AuthState => {
    const modules: AuthModule[] = [
      {
        key: "dashboard",
        name: "儀表板",
        permissions: [
          { key: "dashboard.view", name: "查看儀表板" },
          { key: "dashboard.export", name: "匯出報表" },
          { key: "dashboard.manageWidgets", name: "管理小工具" },
        ],
      },
      {
        key: "projects",
        name: "專案管理",
        permissions: [
          { key: "projects.view", name: "查看專案" },
          { key: "projects.create", name: "新增專案" },
          { key: "projects.edit", name: "編輯專案" },
          { key: "projects.delete", name: "刪除專案" },
          { key: "projects.archive", name: "封存專案" },
        ],
      },
      {
        key: "tasks",
        name: "任務與工單",
        permissions: [
          { key: "tasks.view", name: "查看任務" },
          { key: "tasks.create", name: "新增任務" },
          { key: "tasks.edit", name: "編輯任務" },
          { key: "tasks.delete", name: "刪除任務" },
          { key: "tasks.assign", name: "指派任務" },
          { key: "tasks.approve", name: "審核任務" },
        ],
      },
      {
        key: "reports",
        name: "報表中心",
        permissions: [
          { key: "reports.view", name: "查看報表" },
          { key: "reports.export", name: "匯出報表" },
          { key: "reports.schedule", name: "排程寄送" },
        ],
      },
      {
        key: "users",
        name: "人員與成員",
        permissions: [
          { key: "users.view", name: "查看人員" },
          { key: "users.invite", name: "邀請人員" },
          { key: "users.edit", name: "編輯人員" },
          { key: "users.disable", name: "停用人員" },
        ],
      },
      {
        key: "settings",
        name: "權限設定",
        permissions: [
          { key: "settings.view", name: "查看設定" },
          { key: "settings.edit", name: "修改設定" },
          { key: "settings.security", name: "安全策略" },
          { key: "settings.integrations", name: "第三方整合" },
        ],
      },
      {
        key: "billing",
        name: "帳務與訂閱",
        permissions: [
          { key: "billing.view", name: "查看帳務" },
          { key: "billing.editPlan", name: "調整方案" },
          { key: "billing.invoices", name: "下載發票" },
        ],
      },
    ];

    const roles: AuthRole[] = [
      { id: "super_admin", name: "超級管理員", desc: "全域管理權限（通常僅少數人擁有）", color: "indigo" },
      { id: "pm", name: "專案經理", desc: "管理專案、任務、報表，具較高權限", color: "emerald" },
      { id: "editor", name: "內容編輯", desc: "偏內容/任務編輯，通常無權限設定權限", color: "amber" },
      { id: "viewer", name: "檢視者", desc: "只讀權限，適合主管或外部審閱", color: "slate" },
    ];

    const allPermKeys: string[] = modules.flatMap((m) => m.permissions.map((p) => p.key));

    const grants: GrantsMap = {
      super_admin: [...allPermKeys],
      pm: [
        "dashboard.view",
        "dashboard.export",
        "projects.view",
        "projects.create",
        "projects.edit",
        "projects.archive",
        "tasks.view",
        "tasks.create",
        "tasks.edit",
        "tasks.assign",
        "tasks.approve",
        "reports.view",
        "reports.export",
        "reports.schedule",
        "users.view",
        "users.invite",
        "users.edit",
        "settings.view",
      ],
      editor: [
        "dashboard.view",
        "projects.view",
        "tasks.view",
        "tasks.create",
        "tasks.edit",
        "reports.view",
        "users.view",
      ],
      viewer: ["dashboard.view", "projects.view", "tasks.view", "reports.view", "users.view"],
    };

    const savedUser = readUserFromLocalStorage();
    const fallbackUser: AuthUser = {
      id: uid("user"),
      name: "Musharof",
      roleTitle: "Product Designer",
      avatarUrl: "https://i.pravatar.cc/100?img=12",
    };

    return {
      isLoggedIn: readAuthedFromLocalStorage(),
      currentUser: savedUser || fallbackUser,
      roles,
      modules,
      grants,
    };
  },

  getters: {
    userName(state): string {
      return state.currentUser?.name || "";
    },
    userRoleTitle(state): string {
      return state.currentUser?.roleTitle || "";
    },
    userAvatarUrl(state): string {
      return state.currentUser?.avatarUrl || "";
    },

    allPermissionsFlat(state): PermissionFlat[] {
      return state.modules.flatMap((m) =>
        m.permissions.map((p) => ({
          moduleKey: m.key,
          moduleName: m.name,
          key: p.key,
          name: p.name,
        }))
      );
    },

    allPermissionKeys(state): string[] {
      return state.modules.flatMap((m) => m.permissions.map((p) => p.key));
    },

    moduleOptions(state): { label: string; value: string }[] {
      return state.modules.map((m) => ({ label: m.name, value: m.key }));
    },

    roleOptions(state): { label: string; value: string }[] {
      return state.roles.map((r) => ({ label: r.name, value: r.id }));
    },
  },

  actions: {
    setCurrentUser(payload: Partial<AuthUser>) {
      this.currentUser = { ...this.currentUser, ...(payload || {}) };
      saveUserToLocalStorage(this.currentUser);
    },

    loginMock(account: string, password: string, opts: { remember?: boolean } = {}) {
      const a = String(account || "").trim();
      const p = String(password || "").trim();

      if (a !== "0000" || p !== "0000") return false;

      this.isLoggedIn = true;

      saveAuthedToLocalStorage(true);
      if (opts?.remember !== false) saveUserToLocalStorage(this.currentUser);

      return true;
    },

    hasPermission(roleId: string, permKey: string): boolean {
      const list = this.grants?.[roleId] || [];
      return list.includes(permKey);
    },

    setPermission(roleId: string, permKey: string, enabled: boolean) {
      if (!this.grants[roleId]) this.grants[roleId] = [];
      const list = this.grants[roleId];

      const has = list.includes(permKey);
      if (enabled && !has) list.push(permKey);
      if (!enabled && has) this.grants[roleId] = list.filter((x) => x !== permKey);
    },

    togglePermission(roleId: string, permKey: string) {
      const enabled = this.hasPermission(roleId, permKey);
      this.setPermission(roleId, permKey, !enabled);
    },

    replaceGrants(nextGrants: GrantsMap) {
      this.grants = cloneGrants(nextGrants || {});
    },

    cloneCurrentGrants(): GrantsMap {
      return cloneGrants(this.grants);
    },

    logout() {
      this.isLoggedIn = false;
      saveAuthedToLocalStorage(false);
      console.log("[authStore] logout");
    },
  },
});
