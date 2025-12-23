import type { EventsSettings, TimelineSettings, MediaSettings } from "@/lib/database/types";
import type { UpdateEventsSettingsInput, UpdateTimelineSettingsInput, UpdateMediaSettingsInput } from "@/lib/validations/tribe-settings";

export interface FeatureToggles {
  eventsEnabled: boolean;
  albumsEnabled: boolean;
  pollsEnabled: boolean;
}

export interface UpdateFeatureTogglesInput {
  eventsEnabled?: boolean;
  albumsEnabled?: boolean;
  pollsEnabled?: boolean;
}

/**
 * Fetch timeline settings for a tribe
 */
export async function fetchTimelineSettings(
  tribeId: string
): Promise<TimelineSettings> {
  const response = await fetch(`/api/tribes/${tribeId}/settings/timeline`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch timeline settings");
  }

  return response.json();
}

/**
 * Update timeline settings for a tribe
 */
export async function updateTimelineSettings(
  tribeId: string,
  data: UpdateTimelineSettingsInput
): Promise<TimelineSettings> {
  const response = await fetch(`/api/tribes/${tribeId}/settings/timeline`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update timeline settings");
  }

  return response.json();
}

/**
 * Fetch events settings for a tribe
 */
export async function fetchEventsSettings(
  tribeId: string
): Promise<EventsSettings> {
  const response = await fetch(`/api/tribes/${tribeId}/settings/events`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch events settings");
  }

  return response.json();
}

/**
 * Update events settings for a tribe
 */
export async function updateEventsSettings(
  tribeId: string,
  data: UpdateEventsSettingsInput
): Promise<EventsSettings> {
  const response = await fetch(`/api/tribes/${tribeId}/settings/events`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update events settings");
  }

  return response.json();
}

/**
 * Fetch media settings for a tribe
 */
export async function fetchMediaSettings(
  tribeId: string
): Promise<MediaSettings> {
  const response = await fetch(`/api/tribes/${tribeId}/settings/media`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch media settings");
  }

  return response.json();
}

/**
 * Update media settings for a tribe
 */
export async function updateMediaSettings(
  tribeId: string,
  data: UpdateMediaSettingsInput
): Promise<MediaSettings> {
  const response = await fetch(`/api/tribes/${tribeId}/settings/media`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update media settings");
  }

  return response.json();
}

/**
 * Fetch feature toggles for a tribe
 */
export async function fetchFeatureToggles(
  tribeId: string
): Promise<FeatureToggles> {
  const response = await fetch(`/api/tribes/${tribeId}/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch feature toggles");
  }

  return response.json();
}

/**
 * Update feature toggles for a tribe
 */
export async function updateFeatureToggles(
  tribeId: string,
  data: UpdateFeatureTogglesInput
): Promise<FeatureToggles> {
  const response = await fetch(`/api/tribes/${tribeId}/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update feature toggles");
  }

  return response.json();
}
