export function roleLabel(role?: string | null) {
  if (role === "admin") return "Administrateur";
  if (role === "user") return "Utilisateur";
  return role ?? "-";
}
