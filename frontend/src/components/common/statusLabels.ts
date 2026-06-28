export function statusLabel(value?: string | null) {
  const labels: Record<string, string> = {
    open: "Ouvert",
    draft: "Brouillon",
    pending: "En attente",
    ready: "Pret",
    accepted: "Accepté",
    approved: "Accepté",
    refused: "Refusé",
    rejected: "Refusé",
    scheduled: "Planifié",
    played: "Joué",
    confirmed: "Confirmé",
    disputed: "Contesté",
    cancelled: "Annulé",
    active: "Actif",
    completed: "Terminé",
    upcoming: "À venir",
  };

  if (!value) return "-";
  return labels[value] ?? value;
}

export function statusTone(value?: string | null) {
  const normalized = value ?? "";
  if (["accepted", "open", "active", "approved", "confirmed", "played", "completed", "ready"].includes(normalized)) {
    return "bg-emerald-500/15 text-emerald-400";
  }
  if (["pending", "draft", "upcoming", "scheduled"].includes(normalized)) {
    return "bg-amber-500/15 text-amber-400";
  }
  if (["refused", "rejected", "cancelled", "disputed"].includes(normalized)) {
    return "bg-red-500/15 text-red-300";
  }
  return "";
}
