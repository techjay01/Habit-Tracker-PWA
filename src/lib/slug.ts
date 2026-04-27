/**
 * Converts a habit name into a URL/test-id safe slug.
 * - lowercased
 * - trimmed
 * - spaces collapsed and replaced with hyphens
 * - non-alphanumeric characters (except hyphens) removed
 * - consecutive hyphens collapsed into one
 * - leading/trailing hyphens stripped
 */
export function getHabitSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}