export const STORES = [
  "Gudang Second",
  "Gudang Berry",
  "Amamnah Servis",
  "Kopi Miring",
  "Septy Soflen",
  "RayCorp",
  "Dragon Pet",
] as const;

export const ROLES = [
  "Owner",
  "Admin Office",
  "Supervisor",
  "Finance",
  "Admin Toko",
  "Sales Person",
  "Teknisi",
] as const;

export type Store = (typeof STORES)[number];
export type Role = (typeof ROLES)[number];

export const EDITOR_ROLES: Role[] = ["Owner", "Admin Office", "Supervisor", "Finance"];
export const CREATOR_ROLES: Role[] = ["Owner", "Admin Office", "Supervisor"];
export const OBSIDIAN_ROLES: Role[] = [...EDITOR_ROLES];
export const COMMENT_ROLES: Role[] = [...ROLES];

export function canCreateSop(role: Role) {
  return CREATOR_ROLES.includes(role);
}

export function canEditSop(role: Role) {
  return EDITOR_ROLES.includes(role);
}

export function canAccessObsidian(role: Role) {
  return OBSIDIAN_ROLES.includes(role);
}

export function canEditStore(role: Role, sopStore: Store, activeStore: Store) {
  return role === "Owner" || (canEditSop(role) && sopStore === activeStore);
}
