type Scope = "services" | "products" | "courses";
type Sort = "popular" | "relevance" | "new";
export type DbUserRole = "client" | "provider" | "candidate" | "employer" | "admin";
export type UIMode = "client" | "professional" | "job_seeker" | "organization";

export const searchAdapter = {
  async search(params: {
    q: string;
    scope: Scope;
    domain?: string;
    category?: string;
    tags: string[];
    sort: Sort;
    page: number;
    pageSize: number;
  }) {
    // Mock result set (replace with Supabase query or Algolia)
    const total = params.q ? 3 : 24;
    const start = (params.page - 1) * params.pageSize;
    const count = Math.max(0, Math.min(params.pageSize, total - start));

    const results = Array.from({ length: count }).map((_, i) => {
      const idx = start + i + 1;
      return {
        id: String(idx),
        type: params.scope === "courses" ? "course" : params.scope === "products" ? "product" : "service",
        title: `${params.scope.slice(0, 1).toUpperCase() + params.scope.slice(1)} Result ${idx}`,
        subtitle: params.category ? `Category: ${params.category}` : "Recommended",
        rating: 4.6,
        price: 120,
        href: "/",
        badge: params.scope === "services" ? "Service" : params.scope === "products" ? "Product" : "Course",
      };
    });

    return {
      results,
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
};
// lib/role.ts


export function mapDbRoleToMode(r: DbUserRole): UIMode {
  switch (r) {
    case "client":
      return "client";
    case "provider":
      return "professional";
    case "candidate":
      return "job_seeker";
    case "employer":
      return "organization";
    case "admin":
      // admin should never be default mode; fallback to client for mapping safety
      return "client";
    default:
      return "client";
  }
}

export function getDefaultModeFromRoleSet(roleSet: DbUserRole[]): UIMode {
  const first = roleSet?.[0];
  if (first && first !== "admin") return mapDbRoleToMode(first);

  const fallback = roleSet.find((r) => r !== "admin");
  return fallback ? mapDbRoleToMode(fallback) : "client";
}
