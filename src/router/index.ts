// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import AdminSignInView from "@/views/auth/SignInView.vue";
import DashboardView from "@/views/dashboard/DashboardView.vue";

// brands
import BrandListView from "@/views/brands/BrandListView.vue";
import BrandCreateView from "@/views/brands/BrandCreateView.vue";
import BrandEditView from "@/views/brands/BrandEditView.vue";
import BrandDetailView from "@/views/brands/BrandDetailView.vue";

// tickets
import TicketListView from "@/views/tickets/TicketListView.vue";
import TicketEditView from "@/views/tickets/TicketEditView.vue";
import TicketDetailView from "@/views/tickets/TicketDetailView.vue";

// deals
import DealListView from "@/views/deals/DealListView.vue";
import DealEditView from "@/views/deals/DealEditView.vue";
import DealDetailView from "@/views/deals/DealDetailView.vue";

// categories
import CategoryListView from "@/views/categories/CategoryListView.vue";
import CategoryEditView from "@/views/categories/CategoryEditView.vue";

// themes / banners
import ThemeListView from "@/views/themes/ThemeListView.vue";
import ThemeEditView from "@/views/themes/ThemeEditView.vue";
import ThemeDetailView from "@/views/themes/ThemeDetailView.vue";
import BannerListView from "@/views/banners/BannerListView.vue";

// search
import SearchManagementView from "@/views/search/SearchManagementView.vue";

// orders / fulfillment
import OrderListView from "@/views/orders/OrderListView.vue";
import OrderDetailView from "@/views/orders/OrderDetailView.vue";
import FulfillmentView from "@/views/fulfillment/FulfillmentView.vue";

// payments / finance
import PaymentSettingsView from "@/views/payments/PaymentSettingsView.vue";
import ReconciliationView from "@/views/finance/ReconciliationView.vue";
import InvoiceManagementView from "@/views/finance/InvoiceManagementView.vue";

// support
import SupportTicketListView from "@/views/support/SupportTicketListView.vue";
import SupportTicketDetailView from "@/views/support/SupportTicketDetailView.vue";

// members
import MemberListView from "@/views/members/MemberListView.vue";
import MemberDetailView from "@/views/members/MemberDetailView.vue";

// system
import SiteSettingsView from "@/views/system/SiteSettingsView.vue";
import AdminUserManagementView from "@/views/system/AdminUserManagementView.vue";
import RolePermissionView from "@/views/system/RolePermissionView.vue";

import NotFoundView from "@/views/NotFoundView.vue";

type LayoutType = "admin" | "login";

type SidebarGroup =
  | "dashboard"
  | "catalog"
  | "content"
  | "orders"
  | "finance"
  | "support"
  | "users"
  | "system";

type RouteMetaEx = {
  title: string;
  layout: LayoutType;
  public?: boolean;
  requiresAuth?: boolean;

  // 只有「需要出現在側邊欄」的路由才設定這個
  sidebar?: {
    group: SidebarGroup;
    label: string;
    order: number;
  };

  breadcrumb?: string[];
};

declare module "vue-router" {
  interface RouteMeta extends RouteMetaEx {}
}

const routes: RouteRecordRaw[] = [
  {
    path: "/signin",
    name: "AdminSignIn",
    component: AdminSignInView,
    meta: { title: "登入", layout: "login", public: true },
  },

  { path: "/", redirect: "/dashboard" },

  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: {
      title: "Dashboard",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "dashboard", label: "Dashboard", order: 1 },
      breadcrumb: ["Dashboard"],
    },
  },

  // ===== 品牌管理 =====
  {
    path: "/brands",
    name: "BrandList",
    component: BrandListView,
    meta: {
      title: "品牌管理",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "catalog", label: "品牌管理", order: 10 },
      breadcrumb: ["品牌管理", "品牌列表"],
    },
  },
  {
    path: "/brands/create",
    name: "BrandCreate",
    component: BrandCreateView,
    meta: {
      title: "新增品牌",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["品牌管理", "新增品牌"],
    },
  },
  {
    path: "/brands/:id",
    name: "BrandDetail",
    component: BrandDetailView,
    meta: {
      title: "品牌詳情",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["品牌管理", "品牌詳情"],
    },
  },
  {
    path: "/brands/:id/edit",
    name: "BrandEdit",
    component: BrandEditView,
    meta: {
      title: "編輯品牌",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["品牌管理", "編輯品牌"],
    },
  },

  // ===== 票券管理 =====
  {
    path: "/tickets",
    name: "TicketList",
    component: TicketListView,
    meta: {
      title: "票券管理",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "catalog", label: "票券管理", order: 20 },
      breadcrumb: ["票券管理", "票券列表"],
    },
  },
  {
    path: "/tickets/create",
    name: "TicketCreate",
    component: TicketEditView,
    meta: {
      title: "新增票券",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["票券管理", "新增票券"],
    },
  },
  {
    path: "/tickets/:id",
    name: "TicketDetail",
    component: TicketDetailView,
    meta: {
      title: "票券詳情",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["票券管理", "票券詳情"],
    },
  },
  {
    path: "/tickets/:id/edit",
    name: "TicketEdit",
    component: TicketEditView,
    meta: {
      title: "編輯票券",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["票券管理", "編輯票券"],
    },
  },

  // ===== 店家管理 =====
  {
    path: "/deals",
    name: "DealList",
    component: DealListView,
    meta: {
      title: "店家管理",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "catalog", label: "店家管理", order: 30 },
      breadcrumb: ["店家管理", "店家列表"],
    },
  },
  {
    path: "/deals/create",
    name: "DealCreate",
    component: DealEditView,
    meta: {
      title: "新增店家",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["店家管理", "新增店家"],
    },
  },
  {
    path: "/deals/:id",
    name: "DealDetail",
    component: DealDetailView,
    meta: {
      title: "店家詳情",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["店家管理", "店家詳情"],
    },
  },
  {
    path: "/deals/:id/edit",
    name: "DealEdit",
    component: DealEditView,
    meta: {
      title: "編輯店家",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["店家管理", "編輯店家"],
    },
  },

  // ===== 分類管理 =====
  {
    path: "/categories",
    name: "CategoryList",
    component: CategoryListView,
    meta: {
      title: "分類管理",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "catalog", label: "分類管理", order: 40 },
      breadcrumb: ["分類管理", "分類列表"],
    },
  },
  {
    path: "/categories/create",
    name: "CategoryCreate",
    component: CategoryEditView,
    meta: {
      title: "新增分類",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["分類管理", "新增分類"],
    },
  },
  {
    path: "/categories/:id/edit",
    name: "CategoryEdit",
    component: CategoryEditView,
    meta: {
      title: "編輯分類",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["分類管理", "編輯分類"],
    },
  },

  // ===== 主題 / 輪播管理 =====
  {
    path: "/themes",
    name: "ThemeList",
    component: ThemeListView,
    meta: {
      title: "主題/輪播管理",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "content", label: "主題/輪播管理", order: 50 },
      breadcrumb: ["主題/輪播管理", "主題列表"],
    },
  },
  {
    path: "/themes/create",
    name: "ThemeCreate",
    component: ThemeEditView,
    meta: {
      title: "新增主題",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["主題/輪播管理", "新增主題"],
    },
  },
  {
    path: "/themes/:id",
    name: "ThemeDetail",
    component: ThemeDetailView,
    meta: {
      title: "主題詳情",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["主題/輪播管理", "主題詳情"],
    },
  },
  {
    path: "/themes/:id/edit",
    name: "ThemeEdit",
    component: ThemeEditView,
    meta: {
      title: "編輯主題",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["主題/輪播管理", "編輯主題"],
    },
  },
  {
    path: "/banners",
    name: "BannerList",
    component: BannerListView,
    meta: {
      title: "輪播管理",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["主題/輪播管理", "輪播管理"],
    },
  },

  // ===== 搜尋管理 =====
  {
    path: "/search-management",
    name: "SearchManagement",
    component: SearchManagementView,
    meta: {
      title: "搜尋管理",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "content", label: "搜尋管理", order: 60 },
      breadcrumb: ["搜尋管理"],
    },
  },

  // ===== 訂單管理 =====
  {
    path: "/orders/:id",
    name: "OrderDetail",
    component: OrderDetailView,
    meta: {
      title: "訂單詳情",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["訂單管理", "訂單詳情"],
    },
  },
  {
    path: "/fulfillment",
    name: "Fulfillment",
    component: FulfillmentView,
    meta: {
      title: "票券/兌換狀態",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "orders", label: "票券/兌換狀態", order: 80 },
      breadcrumb: ["票券管理", "票券/兌換狀態"],
    },
  },

  // ===== 金流 / 對帳 =====
  {
    path: "/payments/settings",
    name: "PaymentSettings",
    component: PaymentSettingsView,
    meta: {
      title: "付款方式設定",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "finance", label: "付款方式設定", order: 90 },
      breadcrumb: ["金流/對帳", "付款方式設定"],
    },
  },
  {
    path: "/reconciliation",
    name: "Reconciliation",
    component: ReconciliationView,
    meta: {
      title: "對帳報表",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "finance", label: "對帳報表", order: 100 },
      breadcrumb: ["金流/對帳", "對帳報表"],
    },
  },
  {
    path: "/invoices",
    name: "InvoiceManagement",
    component: InvoiceManagementView,
    meta: {
      title: "發票管理",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["金流/對帳", "發票管理"],
    },
  },

  // ===== 客服 / 工單 =====
  {
    path: "/support/tickets",
    name: "SupportTicketList",
    component: SupportTicketListView,
    meta: {
      title: "客服/工單",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "support", label: "客服/工單", order: 110 },
      breadcrumb: ["客服/工單", "工單列表"],
    },
  },
  {
    path: "/support/tickets/:id",
    name: "SupportTicketDetail",
    component: SupportTicketDetailView,
    meta: {
      title: "工單詳情",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["客服/工單", "工單詳情"],
    },
  },

  // ===== 會員管理 =====
  {
    path: "/members",
    name: "MemberList",
    component: MemberListView,
    meta: {
      title: "會員管理",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "users", label: "會員管理", order: 120 },
      breadcrumb: ["會員管理", "會員列表"],
    },
  },
  {
    path: "/members/:id",
    name: "MemberDetail",
    component: MemberDetailView,
    meta: {
      title: "會員詳情",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["會員管理", "會員詳情"],
    },
  },

  // ===== 權限設定 =====
  {
    path: "/system/site",
    name: "SiteSettings",
    component: SiteSettingsView,
    meta: {
      title: "系統設定",
      layout: "admin",
      requiresAuth: true,
      sidebar: { group: "system", label: "權限設定", order: 130 },
      breadcrumb: ["權限設定", "站點設定"],
    },
  },
  {
    path: "/system/admin-users",
    name: "AdminUserManagement",
    component: AdminUserManagementView,
    meta: {
      title: "後台帳號管理",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["權限設定", "後台帳號管理"],
    },
  },
  {
    path: "/system/roles",
    name: "RolePermission",
    component: RolePermissionView,
    meta: {
      title: "權限角色管理",
      layout: "admin",
      requiresAuth: true,
      breadcrumb: ["權限設定", "權限角色管理"],
    },
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
    meta: { title: "找不到頁面", layout: "login", public: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

function isAuthed(): boolean {
  try {
    return localStorage.getItem("admin_auth") === "1";
  } catch {
    return false;
  }
}

router.beforeEach((to) => {
  const authed = isAuthed();

  if (to?.meta?.public) {
    if (to.name === "AdminSignIn" && authed) return { path: "/dashboard" };
    return true;
  }

  if (to?.meta?.requiresAuth && !authed) {
    return { path: "/signin", query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;
