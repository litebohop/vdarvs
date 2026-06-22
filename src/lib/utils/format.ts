export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

export function formatAddress(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(", ");
}
