/**
 * Tiny class-name joiner. HimVolt deliberately avoids a tailwind-merge
 * dependency — every call site here composes non-conflicting utilities, so a
 * truthy filter + join is all that is needed.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}
