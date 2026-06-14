import { useXTheme } from "../context/XThemeContext";
import { THEME_TOKENS } from "./tokens";

export function useThemeTokens() {
  const { theme } = useXTheme();
  return THEME_TOKENS[theme];
}
