import colors from "@/constants/colors";

/**
 * Always returns the dark palette — this app uses a dark-only design.
 */
export function useColors() {
  return { ...(colors as Record<string, typeof colors.light>).dark, radius: colors.radius };
}
