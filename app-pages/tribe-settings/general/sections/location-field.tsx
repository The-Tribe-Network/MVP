'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';

interface LocationSuggestion {
  id: string;
  placeId: number;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
  type: string;
}

interface LocationData {
  placeId: number;
  displayName: string;
}

interface LocationFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

export function LocationField({ value, onChange }: LocationFieldProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse location on mount or when value changes
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value) as LocationData;
        if (parsed.placeId && parsed.displayName) {
          setSelectedLocation(parsed);
          setSearchQuery(parsed.displayName);
        } else {
          setSearchQuery(value);
          setSelectedLocation(null);
        }
      } catch {
        setSearchQuery(value);
        setSelectedLocation(null);
      }
    } else {
      setSearchQuery('');
      setSelectedLocation(null);
    }
  }, [value]);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {},
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000,
        }
      );
    }
  }, []);

  // Debounced search function
  const searchLocations = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (userLocation) {
          params.append('lat', userLocation.lat.toString());
          params.append('lon', userLocation.lon.toString());
        }

        const response = await fetch(`/api/locations/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error searching locations:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userLocation]
  );

  // Handle input change with debouncing
  const handleInputChange = (newValue: string) => {
    setSearchQuery(newValue);
    
    if (selectedLocation) {
      setSelectedLocation(null);
    }

    // Store as plain text while typing
    onChange(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (newValue.trim().length >= 2) {
        searchLocations(newValue);
        setOpen(true);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    }, 300);
  };

  // Handle suggestion selection
  const handleSelect = (suggestion: LocationSuggestion) => {
    const locationData: LocationData = {
      placeId: suggestion.placeId,
      displayName: suggestion.fullName,
    };

    const locationJson = JSON.stringify(locationData);
    setSelectedLocation(locationData);
    setSearchQuery(suggestion.fullName);
    onChange(locationJson);
    setOpen(false);
    setSuggestions([]);
  };

  // Handle clearing the selected location
  const handleClearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    onChange('');
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="City, State or Country"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setOpen(true);
                }
              }}
              autoComplete="off"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-anchor-width)] p-0"
          align="start"
          side="bottom"
        >
          <Command className="bg-popover">
            <CommandList>
              {suggestions.length === 0 && !isLoading ? (
                <CommandEmpty>No locations found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      value={suggestion.fullName}
                      onSelect={() => handleSelect(suggestion)}
                      className="cursor-pointer"
                    >
                      <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <div className="flex flex-col">
                        <span className="font-medium">{suggestion.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.fullName}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLocation && (
        <div className="mt-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-foreground truncate" title={selectedLocation.displayName}>
              {selectedLocation.displayName}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearLocation}
            className="h-7 w-7 p-0 shrink-0"
            aria-label="Remove location"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

