import { NextRequest, NextResponse } from "next/server";

interface NominatimResult {
  place_id: number;
  licence: string;
  powered_by: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

interface LocationSuggestion {
  id: string;
  placeId: number;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
  type: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Build Nominatim API URL
    // Using OpenStreetMap Nominatim (free, no API key required)
    const baseUrl = "https://nominatim.openstreetmap.org/search";
    const params = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: "10",
      // Add user's location bias if available
      ...(lat && lon && {
        viewbox: `${parseFloat(lon) - 0.1},${parseFloat(lat) - 0.1},${parseFloat(lon) + 0.1},${parseFloat(lat) + 0.1}`,
        bounded: "1",
      }),
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        "User-Agent": "Tribe App Location Search", // Required by Nominatim
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch location suggestions");
    }

    const data: NominatimResult[] = await response.json();

    // Transform Nominatim results to our format
    const suggestions: LocationSuggestion[] = data.map((result) => {
      // Extract a cleaner name from display_name
      // display_name format: "Name, City, State, Country"
      const parts = result.display_name.split(",");
      const name = parts[0].trim();
      const fullName = result.display_name;

      return {
        id: result.place_id.toString(),
        placeId: result.place_id,
        name,
        fullName,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        type: result.type || result.class || "location",
      };
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error searching locations:", error);
    return NextResponse.json(
      { error: "Failed to search locations", suggestions: [] },
      { status: 500 }
    );
  }
}

