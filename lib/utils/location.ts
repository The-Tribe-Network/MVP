/**
 * Location utility functions for handling location data
 * Locations can be stored as:
 * - JSON string: {"placeId": 123, "displayName": "Full Address"}
 * - Plain string: "User typed location"
 */

export interface LocationData {
  placeId: number
  displayName: string
}

/**
 * Parse location string and return LocationData if valid, null otherwise
 */
export function parseLocation(location: string | null | undefined): LocationData | null {
  if (!location) return null

  try {
    const parsed = JSON.parse(location) as LocationData
    if (parsed.placeId && parsed.displayName) {
      return parsed
    }
  } catch {
    // Not JSON, return null
  }

  return null
}

/**
 * Extract display name from location string
 * Returns the displayName if it's a LocationData object, otherwise returns the string as-is
 */
export function getLocationDisplayName(location: string | null | undefined): string {
  if (!location) return ''

  const parsed = parseLocation(location)
  if (parsed) {
    return parsed.displayName
  }

  return location
}

/**
 * Extract place ID from location string
 * Returns the placeId if it's a LocationData object, otherwise returns null
 */
export function getLocationPlaceId(location: string | null | undefined): number | null {
  const parsed = parseLocation(location)
  return parsed?.placeId ?? null
}

