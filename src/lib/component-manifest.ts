/**
 * Stencil Studio — Component Manifest
 *
 * Complete inventory of every project component.
 * This is STATIC DATA — not dynamic imports. Update when adding components.
 *
 * `tokenCompliant: true` means the component uses CSS variables / Tailwind
 * organic palette exclusively (no hardcoded hex/hsl values).
 * Set to false if it contains inline styles with literal color values.
 */

export type ComponentStatus = "stable" | "beta" | "deprecated" | "experimental";

export type ComponentCategory =
  | "navigation"
  | "hero"
  | "sections"
  | "admin"
  | "account"
  | "ui-primitive"
  | "design-system"
  | "magic-ui";

export interface ComponentManifestEntry {
  id:             string;
  name:           string;
  path:           string;          // relative to src/
  category:       ComponentCategory;
  usedOnPages:    string[];        // route paths from App.tsx
  variants:       string[];        // named exports or prop variants
  status:         ComponentStatus;
  tokenCompliant: boolean;
  description:    string;
}

// ─── All pages for convenience ────────────────────────────────────────────────
const ALL_PUBLIC_PAGES = [
  "/", "/koleksiyon", "/urun/:id", "/nasil-calisir",
  "/ozel-tasarim", "/hakkimizda",
];

const ALL_AUTH_PAGES   = ["/giris", "/kayit"];
const ALL_ACCOUNT_PAGES = [
  "/hesabim", "/hesabim/siparisler", "/hesabim/siparisler/:orderId",
  "/hesabim/favoriler", "/hesabim/adresler", "/hesabim/profil",
  "/hesabim/bildirimler", "/hesabim/ayarlar",
];
const ADMIN_PAGES = ["/admin"];

// ─── Manifest ─────────────────────────────────────────────────────────────────

export const componentManifest: ComponentManifestEntry[] = [

  // ── Navigation ─────────────────────────────────────────────────────────────
  {
    id: "navbar",
    name: "Navbar",
    path: "components/navigation/Navbar.tsx",
    category: "navigation",
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_AUTH_PAGES, ...ALL_ACCOUNT_PAGES, "/odeme"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Primary navigation bar with search, cart and profile actions",
  },
  {
    id: "global-widgets",
    name: "GlobalWidgets",
    path: "components/navigation/GlobalWidgets.tsx",
    category: "navigation",
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_ACCOUNT_PAGES, "/odeme"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Floating widgets overlay (cart, chatbot, scroll-to-top)",
  },
  {
    id: "chatbot-widget",
    name: "ChatbotWidget",
    path: "components/navigation/ChatbotWidget.tsx",
    category: "navigation",
    usedOnPages: ALL_PUBLIC_PAGES,
    variants: ["default"],
    status: "beta",
    tokenCompliant: true,
    description: "Floating AI chat assistant button and panel",
  },
  {
    id: "dark-mode-toggle",
    name: "DarkModeToggle",
    path: "components/navigation/DarkModeToggle.tsx",
    category: "navigation",
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_ACCOUNT_PAGES],
    variants: ["icon", "labeled"],
    status: "stable",
    tokenCompliant: true,
    description: "Light/dark mode toggle button",
  },
  {
    id: "floating-cart",
    name: "FloatingCart",
    path: "components/navigation/FloatingCart.tsx",
    category: "navigation",
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_ACCOUNT_PAGES],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Floating cart icon with item count badge",
  },
  {
    id: "profile-dropdown",
    name: "ProfileDropdown",
    path: "components/navigation/ProfileDropdown.tsx",
    category: "navigation",
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_ACCOUNT_PAGES],
    variants: ["authenticated", "guest"],
    status: "stable",
    tokenCompliant: true,
    description: "User profile dropdown menu",
  },
  {
    id: "search-popover",
    name: "SearchPopover",
    path: "components/navigation/SearchPopover.tsx",
    category: "navigation",
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_ACCOUNT_PAGES],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Product search popover with live results",
  },
  {
    id: "theme-switcher",
    name: "ThemeSwitcher",
    path: "components/navigation/ThemeSwitcher.tsx",
    category: "navigation",
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_ACCOUNT_PAGES],
    variants: ["dropdown", "popover"],
    status: "stable",
    tokenCompliant: true,
    description: "Theme selection (default, ocean, forest, lavender)",
  },

  // ── Hero ───────────────────────────────────────────────────────────────────
  {
    id: "hero-experience",
    name: "HeroExperience",
    path: "components/hero/HeroExperience.tsx",
    category: "hero",
    usedOnPages: ["/"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: false, // uses inline canvas colors
    description: "Full-screen hero with stencil reveal interaction",
  },
  {
    id: "stencil-canvas",
    name: "StencilCanvas",
    path: "components/hero/StencilCanvas.tsx",
    category: "hero",
    usedOnPages: ["/"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: false, // canvas operations use hardcoded colors
    description: "Canvas-based stencil reveal mechanic with RAF loop",
  },
  {
    id: "surface-reveal",
    name: "SurfaceReveal",
    path: "components/hero/SurfaceReveal.tsx",
    category: "hero",
    usedOnPages: ["/"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Animated surface texture reveal overlay",
  },

  // ── Sections ──────────────────────────────────────────────────────────────
  {
    id: "collection-section",
    name: "CollectionSection",
    path: "components/sections/CollectionSection.tsx",
    category: "sections",
    usedOnPages: ["/"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Featured product collection grid on the landing page",
  },
  {
    id: "cta-section",
    name: "CTASection",
    path: "components/sections/CTASection.tsx",
    category: "sections",
    usedOnPages: ["/", "/nasil-calisir"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Call-to-action banner section",
  },
  {
    id: "features-section",
    name: "FeaturesSection",
    path: "components/sections/FeaturesSection.tsx",
    category: "sections",
    usedOnPages: ["/"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Product features highlight grid",
  },
  {
    id: "footer",
    name: "Footer",
    path: "components/sections/Footer.tsx",
    category: "sections",
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_ACCOUNT_PAGES],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Site-wide footer with links and newsletter",
  },
  {
    id: "how-it-works-section",
    name: "HowItWorksSection",
    path: "components/sections/HowItWorksSection.tsx",
    category: "sections",
    usedOnPages: ["/nasil-calisir"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Step-by-step stencil process walkthrough",
  },
  {
    id: "testimonials-section",
    name: "TestimonialsSection",
    path: "components/sections/TestimonialsSection.tsx",
    category: "sections",
    usedOnPages: ["/"],
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Customer testimonial carousel",
  },

  // ── Account ───────────────────────────────────────────────────────────────
  {
    id: "account-layout",
    name: "AccountLayout",
    path: "components/account/AccountLayout.tsx",
    category: "account",
    usedOnPages: ALL_ACCOUNT_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Shared layout wrapper for all /hesabim/* pages",
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    id: "admin-products",
    name: "AdminProducts",
    path: "components/admin/AdminProducts.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Product management panel (CRUD)",
  },
  {
    id: "admin-orders",
    name: "AdminOrders",
    path: "components/admin/AdminOrders.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Order management and status tracking",
  },
  {
    id: "admin-users",
    name: "AdminUsers",
    path: "components/admin/AdminUsers.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "User account management panel",
  },
  {
    id: "admin-categories",
    name: "AdminCategories",
    path: "components/admin/AdminCategories.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Product category and tag management",
  },
  {
    id: "admin-messages",
    name: "AdminMessages",
    path: "components/admin/AdminMessages.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Customer message inbox",
  },
  {
    id: "admin-media",
    name: "AdminMedia",
    path: "components/admin/AdminMedia.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Media library management",
  },
  {
    id: "admin-pages",
    name: "AdminPages",
    path: "components/admin/AdminPages.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "CMS page editor",
  },
  {
    id: "admin-analytics",
    name: "AdminAnalytics",
    path: "components/admin/AdminAnalytics.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Sales and traffic analytics dashboard",
  },
  {
    id: "admin-settings",
    name: "AdminSettings",
    path: "components/admin/AdminSettings.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Global admin settings panel",
  },
  {
    id: "admin-component-library",
    name: "AdminComponentLibrary",
    path: "components/admin/AdminComponentLibrary.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "beta",
    tokenCompliant: false, // uses hsl() inline for gradient headers
    description: "Magic UI component browser with validation",
  },
  {
    id: "component-library-manager",
    name: "ComponentLibraryManager",
    path: "components/admin/ComponentLibraryManager.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "beta",
    tokenCompliant: false, // uses hsl() inline for gradient + preview vars
    description: "Working-only component browser with live appearance controls",
  },
  {
    id: "admin-design-system",
    name: "AdminDesignSystem",
    path: "components/admin/AdminDesignSystem.tsx",
    category: "admin",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "beta",
    tokenCompliant: true,
    description: "Design token editor, component tree, usage matrix and validation",
  },

  // ── Design system ─────────────────────────────────────────────────────────
  {
    id: "token-swatch",
    name: "TokenSwatch",
    path: "components/design-system/TokenSwatch.tsx",
    category: "design-system",
    usedOnPages: ADMIN_PAGES,
    variants: ["sm", "md", "lg"],
    status: "stable",
    tokenCompliant: true,
    description: "Color swatch showing CSS var name, resolved value and copy button",
  },
  {
    id: "token-editor",
    name: "TokenEditor",
    path: "components/design-system/TokenEditor.tsx",
    category: "design-system",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Live HSL color editor that mutates CSS variables directly on root",
  },
  {
    id: "component-tree",
    name: "ComponentTree",
    path: "components/design-system/ComponentTree.tsx",
    category: "design-system",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Searchable tree view of the component manifest",
  },
  {
    id: "usage-badge",
    name: "UsageBadge",
    path: "components/design-system/UsageBadge.tsx",
    category: "design-system",
    usedOnPages: ADMIN_PAGES,
    variants: ["default"],
    status: "stable",
    tokenCompliant: true,
    description: "Inline badge showing page usage count with tooltip",
  },

  // ── UI primitives (shadcn/ui — representative subset) ─────────────────────
  ...[
    ["button",          "Button",          "Trigger element with 6 variants"],
    ["card",            "Card",            "Surface container with header/content/footer"],
    ["dialog",          "Dialog",          "Accessible modal dialog"],
    ["input",           "Input",           "Text input with label support"],
    ["badge",           "Badge",           "Status and category label chip"],
    ["tooltip",         "Tooltip",         "Contextual hover tooltip"],
    ["tabs",            "Tabs",            "Tabbed content switcher"],
    ["select",          "Select",          "Accessible select dropdown"],
    ["checkbox",        "Checkbox",        "Boolean checkbox input"],
    ["slider",          "Slider",          "Range value slider"],
    ["switch",          "Switch",          "Binary toggle switch"],
    ["textarea",        "Textarea",        "Multi-line text input"],
    ["skeleton",        "Skeleton",        "Loading placeholder shimmer"],
    ["progress",        "Progress",        "Linear progress indicator"],
    ["separator",       "Separator",       "Horizontal/vertical rule"],
    ["table",           "Table",           "Data table with thead/tbody"],
    ["avatar",          "Avatar",          "User avatar with fallback"],
    ["popover",         "Popover",         "Floating content overlay"],
    ["dropdown-menu",   "DropdownMenu",    "Accessible dropdown menu"],
    ["sheet",           "Sheet",           "Side-panel drawer"],
    ["sonner",          "Sonner",          "Toast notification system"],
    ["shimmer-button",  "ShimmerButton",   "Magic UI shimmer button (custom)"],
  ].map(([id, name, description]) => ({
    id,
    name,
    path: `components/ui/${id}.tsx`,
    category: "ui-primitive" as ComponentCategory,
    usedOnPages: [...ALL_PUBLIC_PAGES, ...ALL_AUTH_PAGES, ...ALL_ACCOUNT_PAGES, ...ADMIN_PAGES],
    variants: [],
    status: "stable" as ComponentStatus,
    tokenCompliant: true,
    description,
  })),
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getByCategory(category: ComponentCategory): ComponentManifestEntry[] {
  return componentManifest.filter((c) => c.category === category);
}

export function getByPage(route: string): ComponentManifestEntry[] {
  return componentManifest.filter((c) => c.usedOnPages.includes(route));
}

export function getByStatus(status: ComponentStatus): ComponentManifestEntry[] {
  return componentManifest.filter((c) => c.status === status);
}

export function getTokenNonCompliant(): ComponentManifestEntry[] {
  return componentManifest.filter((c) => !c.tokenCompliant);
}

export function getById(id: string): ComponentManifestEntry | undefined {
  return componentManifest.find((c) => c.id === id);
}

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  "navigation":    "Navigation",
  "hero":          "Hero",
  "sections":      "Sections",
  "admin":         "Admin",
  "account":       "Account",
  "ui-primitive":  "UI Primitives",
  "design-system": "Design System",
  "magic-ui":      "Magic UI",
};
