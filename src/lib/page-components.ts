/**
 * Stencil Studio — Page Dependency Map
 *
 * Maps every route to the components it uses.
 * Component IDs reference componentManifest entries in component-manifest.ts.
 *
 * This is static data — update when pages gain or lose components.
 */

export interface PageDependencyEntry {
  route:       string;
  pageName:    string;
  pageFile:    string;
  components:  string[];  // component IDs from componentManifest
  lazyLoaded:  boolean;
  isProtected: boolean;   // requires auth
}

export const pageDependencyMap: PageDependencyEntry[] = [
  {
    route: "/",
    pageName: "Index",
    pageFile: "pages/Index.tsx",
    components: [
      "navbar", "global-widgets", "floating-cart", "chatbot-widget",
      "hero-experience", "stencil-canvas", "surface-reveal",
      "features-section", "collection-section", "testimonials-section",
      "cta-section", "footer",
      "button", "card", "badge",
    ],
    lazyLoaded: false,
    isProtected: false,
  },
  {
    route: "/koleksiyon",
    pageName: "Collection",
    pageFile: "pages/Collection.tsx",
    components: [
      "navbar", "global-widgets", "floating-cart", "footer",
      "card", "badge", "button", "select", "input", "slider",
    ],
    lazyLoaded: false,
    isProtected: false,
  },
  {
    route: "/urun/:id",
    pageName: "ProductDetail",
    pageFile: "pages/ProductDetail.tsx",
    components: [
      "navbar", "global-widgets", "floating-cart", "footer",
      "card", "badge", "button", "separator", "tabs", "avatar",
    ],
    lazyLoaded: false,
    isProtected: false,
  },
  {
    route: "/nasil-calisir",
    pageName: "HowItWorks",
    pageFile: "pages/HowItWorks.tsx",
    components: [
      "navbar", "global-widgets", "how-it-works-section", "cta-section", "footer",
      "card", "button",
    ],
    lazyLoaded: false,
    isProtected: false,
  },
  {
    route: "/ozel-tasarim",
    pageName: "CustomDesign",
    pageFile: "pages/CustomDesign.tsx",
    components: [
      "navbar", "global-widgets", "footer",
      "card", "button", "input", "textarea", "select",
    ],
    lazyLoaded: false,
    isProtected: false,
  },
  {
    route: "/hakkimizda",
    pageName: "About",
    pageFile: "pages/About.tsx",
    components: [
      "navbar", "global-widgets", "footer",
      "card", "separator",
    ],
    lazyLoaded: false,
    isProtected: false,
  },
  {
    route: "/giris",
    pageName: "Login",
    pageFile: "pages/Login.tsx",
    components: [
      "navbar",
      "card", "button", "input", "separator",
    ],
    lazyLoaded: false,
    isProtected: false,
  },
  {
    route: "/kayit",
    pageName: "Register",
    pageFile: "pages/Register.tsx",
    components: [
      "navbar",
      "card", "button", "input", "checkbox",
    ],
    lazyLoaded: false,
    isProtected: false,
  },
  {
    route: "/odeme",
    pageName: "Checkout",
    pageFile: "pages/Checkout.tsx",
    components: [
      "navbar", "global-widgets",
      "card", "button", "input", "separator", "progress",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/admin",
    pageName: "AdminDashboard",
    pageFile: "pages/AdminDashboard.tsx",
    components: [
      "admin-products", "admin-orders", "admin-users", "admin-categories",
      "admin-messages", "admin-media", "admin-pages", "admin-analytics",
      "admin-settings", "component-library-manager", "admin-design-system",
      "button", "card", "badge", "input", "table", "dialog", "separator",
      "tabs", "select", "progress", "skeleton",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/hesabim",
    pageName: "AccountDashboard",
    pageFile: "pages/account/Dashboard.tsx",
    components: [
      "navbar", "account-layout", "footer",
      "card", "button", "badge", "separator",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/hesabim/siparisler",
    pageName: "AccountOrders",
    pageFile: "pages/account/AccountOrders.tsx",
    components: [
      "navbar", "account-layout", "footer",
      "card", "badge", "button", "separator", "table",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/hesabim/siparisler/:orderId",
    pageName: "OrderDetail",
    pageFile: "pages/account/OrderDetail.tsx",
    components: [
      "navbar", "account-layout", "footer",
      "card", "badge", "separator", "button",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/hesabim/favoriler",
    pageName: "AccountFavorites",
    pageFile: "pages/account/AccountFavorites.tsx",
    components: [
      "navbar", "account-layout", "footer",
      "card", "button", "badge",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/hesabim/adresler",
    pageName: "Addresses",
    pageFile: "pages/account/Addresses.tsx",
    components: [
      "navbar", "account-layout", "footer",
      "card", "button", "input", "dialog", "select",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/hesabim/profil",
    pageName: "AccountProfile",
    pageFile: "pages/account/AccountProfile.tsx",
    components: [
      "navbar", "account-layout", "footer",
      "card", "button", "input", "avatar",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/hesabim/bildirimler",
    pageName: "Notifications",
    pageFile: "pages/account/Notifications.tsx",
    components: [
      "navbar", "account-layout", "footer",
      "card", "badge", "button", "switch", "separator",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/hesabim/ayarlar",
    pageName: "AccountSettings",
    pageFile: "pages/account/AccountSettings.tsx",
    components: [
      "navbar", "account-layout", "footer",
      "card", "button", "input", "switch", "select", "separator",
    ],
    lazyLoaded: false,
    isProtected: true,
  },
  {
    route: "/showcase",
    pageName: "ComponentShowcase",
    pageFile: "pages/ComponentShowcase.tsx",
    components: [],  // all Magic UI components loaded dynamically
    lazyLoaded: true,
    isProtected: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPageByRoute(route: string): PageDependencyEntry | undefined {
  return pageDependencyMap.find((p) => p.route === route);
}

export function getPagesForComponent(componentId: string): PageDependencyEntry[] {
  return pageDependencyMap.filter((p) => p.components.includes(componentId));
}

export function getProtectedPages(): PageDependencyEntry[] {
  return pageDependencyMap.filter((p) => p.isProtected);
}
