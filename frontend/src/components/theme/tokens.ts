import type { XTheme } from "../context/XThemeContext";

export interface ThemeTokens {
  shellBg: string;
  sidebarBg: string;
  headerBg: string;
  headerBorder: string;
  headerIconBtn: string;
  headerDropdown: string;
  panel: string;
  panelGlass: string;
  card: string;
  cardHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  tableHead: string;
  tableRow: string;
  tableDivide: string;
  navText: string;
  navHover: string;
  navActiveBg: string;
  vsBadge: string;
  scoreBox: string;
  tabActive: string;
  tabInactive: string;
  metricBg: string;
  dropdownActive: string;
  modalBackdrop: string;
  glassBox: string;
  btnSecondary: string;
}

export const THEME_TOKENS: Record<XTheme, ThemeTokens> = {
  light: {
    shellBg: "bg-zinc-50",
    sidebarBg: "bg-white border-zinc-200 shadow-sm",
    headerBg: "bg-white",
    headerBorder: "border-zinc-200",
    headerIconBtn: "border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800",
    headerDropdown: "border-zinc-200 bg-white text-zinc-700",
    panel: "bg-white border-zinc-200 shadow-sm",
    panelGlass: "bg-white border-zinc-200 shadow-md",
    card: "bg-white border-zinc-200 shadow-sm",
    cardHover: "hover:border-zinc-300 hover:shadow-md",
    textPrimary: "text-zinc-900",
    textSecondary: "text-zinc-600",
    textMuted: "text-zinc-500",
    border: "border-zinc-200",
    borderSubtle: "border-zinc-100",
    tableHead: "bg-zinc-50 text-zinc-600",
    tableRow: "text-zinc-800 hover:bg-zinc-50",
    tableDivide: "divide-zinc-100",
    navText: "text-zinc-600",
    navHover: "hover:bg-zinc-100 hover:text-zinc-900",
    navActiveBg: "bg-zinc-100",
    vsBadge: "bg-zinc-900 text-white shadow-md",
    scoreBox: "bg-zinc-100 text-zinc-900",
    tabActive: "bg-zinc-900 text-white shadow-sm",
    tabInactive: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
    metricBg: "bg-zinc-100",
    dropdownActive: "bg-zinc-900 text-white",
    modalBackdrop: "bg-zinc-900/40 backdrop-blur-sm",
    glassBox: "border border-zinc-200/80 bg-white/70 backdrop-blur-md shadow-sm",
    btnSecondary: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200",
  },
  dark: {
    shellBg: "bg-slate-950",
    sidebarBg: "bg-slate-950/95 border-white/[0.06]",
    headerBg: "bg-slate-950",
    headerBorder: "border-white/[0.06]",
    headerIconBtn: "border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white",
    headerDropdown: "border-white/[0.06] bg-slate-900 text-slate-300",
    panel: "bg-slate-900/60 border-white/[0.06] backdrop-blur-xl",
    panelGlass: "bg-slate-900/60 border-white/[0.06] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
    card: "bg-slate-900/60 border-white/[0.06] backdrop-blur-xl",
    cardHover: "hover:bg-white/[0.04] hover:border-white/[0.1]",
    textPrimary: "text-white",
    textSecondary: "text-slate-400",
    textMuted: "text-slate-500",
    border: "border-white/[0.06]",
    borderSubtle: "border-white/[0.04]",
    tableHead: "bg-white/[0.02] text-slate-400",
    tableRow: "text-slate-300 hover:bg-white/[0.02]",
    tableDivide: "divide-white/[0.04]",
    navText: "text-slate-400",
    navHover: "hover:bg-white/[0.03] hover:text-slate-200",
    navActiveBg: "bg-white/[0.06]",
    vsBadge: "bg-brand-500 text-white shadow-lg shadow-brand-500/20",
    scoreBox: "bg-white/[0.06] text-white",
    tabActive: "bg-white/[0.08] text-white",
    tabInactive: "text-slate-400 hover:bg-white/[0.04] hover:text-white",
    metricBg: "bg-white/[0.04]",
    dropdownActive: "bg-white/[0.1] text-white",
    modalBackdrop: "bg-slate-950/75 backdrop-blur-sm",
    glassBox: "border border-white/[0.1] bg-white/[0.06] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    btnSecondary: "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] border border-white/[0.08]",
  },
  zinc: {
    shellBg: "bg-zinc-950",
    sidebarBg: "bg-zinc-950/95 border-zinc-800/50",
    headerBg: "bg-zinc-950",
    headerBorder: "border-zinc-800/50",
    headerIconBtn: "border-zinc-800/50 text-zinc-400 hover:bg-zinc-800/40 hover:text-white",
    headerDropdown: "border-zinc-800/50 bg-zinc-900 text-zinc-300",
    panel: "bg-zinc-900/60 border-zinc-800/50 backdrop-blur-xl",
    panelGlass: "bg-zinc-900/60 border-zinc-800/50 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
    card: "bg-zinc-900/60 border-zinc-800/50 backdrop-blur-xl",
    cardHover: "hover:bg-zinc-800/40 hover:border-zinc-700/60",
    textPrimary: "text-white",
    textSecondary: "text-zinc-400",
    textMuted: "text-zinc-500",
    border: "border-zinc-800/50",
    borderSubtle: "border-zinc-800/30",
    tableHead: "bg-zinc-900/50 text-zinc-500",
    tableRow: "text-zinc-300 hover:bg-zinc-800/30",
    tableDivide: "divide-zinc-800/40",
    navText: "text-zinc-400",
    navHover: "hover:bg-zinc-800/40 hover:text-zinc-200",
    navActiveBg: "bg-zinc-800/50",
    vsBadge: "bg-brand-500 text-white shadow-lg shadow-brand-500/20",
    scoreBox: "bg-zinc-800/60 text-white",
    tabActive: "bg-zinc-800 text-white",
    tabInactive: "text-zinc-400 hover:bg-zinc-800/40 hover:text-white",
    metricBg: "bg-zinc-800/40",
    dropdownActive: "bg-zinc-800 text-white",
    modalBackdrop: "bg-zinc-950/75 backdrop-blur-sm",
    glassBox: "border border-zinc-700/50 bg-zinc-800/35 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    btnSecondary: "bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800/60 border border-zinc-700/50",
  },
};
