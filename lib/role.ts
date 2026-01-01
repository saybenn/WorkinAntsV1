// src/lib/role.ts
export type DbUserRole = "client" | "provider" | "candidate" | "employer" | "admin";
export type UIMode = "client" | "professional" | "job_seeker" | "organization";

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
    default:
      return "client";
  }
}

export function getDefaultModeFromRoleSet(roleSet: DbUserRole[]): UIMode {
  const first = roleSet[0];
  if (first && first !== "admin") return mapDbRoleToMode(first);

  const fallback = roleSet.find((r) => r !== "admin");
  return fallback ? mapDbRoleToMode(fallback) : "client";
}
