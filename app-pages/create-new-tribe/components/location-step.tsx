'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useFormContext, type Control } from 'react-hook-form'
import { MapPin, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import type { CreateTribeFormInput } from '@/lib/validations/tribe'

interface LocationSuggestion {
  id: string
  placeId: number
  name: string
  fullName: string
  latitude: number
  longitude: number
  type: string
}

interface LocationData {
  placeId: number
  displayName: string
}

interface LocationStepProps {
  control: Control<CreateTribeFormInput>
}

export function LocationStep({ control }: LocationStepProps) {
  const { setValue, watch } = useFormContext<CreateTribeFormInput>()
  const location = watch('location')

  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isUserTypingRef = useRef(false)
  const previousLocationRef = useRef<string | null>(null)
  const wasFocusedRef = useRef(false)
  const searchInProgressRef = useRef(false)
  const isInitialMountRef = useRef(true)

  // Parse location on mount
  useEffect(() => {
    if (isInitialMountRef.current) {
      if (location) {
        try {
          const parsed = JSON.parse(location) as LocationData
          if (parsed.placeId && parsed.displayName) {
            setSelectedLocation(parsed)
            setSearchQuery(parsed.displayName)
          } else {
            setSearchQuery(location)
            setSelectedLocation(null)
          }
        } catch {
          setSearchQuery(location)
          setSelectedLocation(null)
        }
      }
      previousLocationRef.current = location
      isInitialMountRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Parse location when location prop changes
  useEffect(() => {
    if (!isInitialMountRef.current && location !== previousLocationRef.current && !isUserTypingRef.current && !searchInProgressRef.current) {
      try {
        const parsed = JSON.parse(location) as LocationData
        if (parsed.placeId && parsed.displayName) {
          setSelectedLocation(parsed)
          setSearchQuery(parsed.displayName)
        } else {
          setSearchQuery(location)
          setSelectedLocation(null)
        }
      } catch {
        setSearchQuery(location)
        setSelectedLocation(null)
      }
      previousLocationRef.current = location
    }
  }, [location])

  // Restore focus after state updates
  useEffect(() => {
    if ((isUserTypingRef.current || searchInProgressRef.current) && wasFocusedRef.current && inputRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (inputRef.current && document.activeElement !== inputRef.current && wasFocusedRef.current) {
            inputRef.current.focus()
            const length = inputRef.current.value.length
            inputRef.current.setSelectionRange(length, length)
          }
        })
      })
    }
  })

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      )
    }
  }, [])

  // Debounced search function
  const searchLocations = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setSuggestions([])
        setIsLoading(false)
        searchInProgressRef.current = false
        if (debounceTimerRef.current === null) {
          setTimeout(() => {
            if (debounceTimerRef.current === null && !searchInProgressRef.current) {
              isUserTypingRef.current = false
            }
          }, 50)
        }
        return
      }

      searchInProgressRef.current = true
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ q: query })
        if (userLocation) {
          params.append('lat', userLocation.lat.toString())
          params.append('lon', userLocation.lon.toString())
        }

        const response = await fetch(`/api/locations/search?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch locations')

        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        console.error('Error searching locations:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
        searchInProgressRef.current = false

        if (wasFocusedRef.current && inputRef.current && document.activeElement !== inputRef.current) {
          requestAnimationFrame(() => {
            if (inputRef.current && wasFocusedRef.current && document.activeElement !== inputRef.current) {
              inputRef.current.focus()
              const length = inputRef.current.value.length
              inputRef.current.setSelectionRange(length, length)
            }
          })
        }

        setTimeout(() => {
          if (debounceTimerRef.current === null && !searchInProgressRef.current) {
            isUserTypingRef.current = false
          }
        }, 100)
      }
    },
    [userLocation]
  )

  const handleClearLocation = () => {
    setSelectedLocation(null)
    setSearchQuery('')
    setValue('location', '', { shouldValidate: true })
    previousLocationRef.current = ''
    setOpen(false)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleInputChange = (value: string) => {
    isUserTypingRef.current = true
    setSearchQuery(value)

    if (selectedLocation) {
      setSelectedLocation(null)
      setValue('location', value, { shouldValidate: true })
    } else {
      setValue('location', value, { shouldValidate: true })
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      if (value.trim().length >= 2) {
        searchLocations(value)
        setOpen(true)
      } else {
        setSuggestions([])
        setOpen(false)
        setTimeout(() => {
          if (debounceTimerRef.current === null && !searchInProgressRef.current) {
            isUserTypingRef.current = false
          }
        }, 50)
      }
    }, 300)
  }

  const handleSelect = (suggestion: LocationSuggestion) => {
    const locationData: LocationData = {
      placeId: suggestion.placeId,
      displayName: suggestion.fullName,
    }
    const locationJson = JSON.stringify(locationData)
    isUserTypingRef.current = false
    setSelectedLocation(locationData)
    setSearchQuery(suggestion.fullName)
    setValue('location', locationJson, { shouldValidate: true })
    previousLocationRef.current = locationJson
    setOpen(false)
    setSuggestions([])
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="h-12 w-12 text-primary" />
        </div>
      </div>

      <FormField
        control={control}
        name="location"
        render={() => (
          <FormItem>
            <FormLabel>Location *</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverAnchor asChild>
                <div className="relative">
                  <FormControl>
                    <Input
                      ref={inputRef}
                      placeholder="City, State or Country"
                      value={searchQuery}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onFocus={() => {
                        wasFocusedRef.current = true
                        if (suggestions.length > 0) setOpen(true)
                      }}
                      onBlur={() => {
                        wasFocusedRef.current = false
                        setTimeout(() => { isUserTypingRef.current = false }, 200)
                      }}
                      className="bg-white/5 border-zinc-700"
                      autoComplete="off"
                    />
                  </FormControl>
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </PopoverAnchor>
              <PopoverContent className="w-[var(--radix-popover-anchor-width)] p-0" align="start" side="bottom">
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
                              <span className="text-xs text-muted-foreground">{suggestion.fullName}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormDescription>This helps members find local events and meetups</FormDescription>
            <FormMessage />

            {selectedLocation && (
              <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 flex items-center justify-between gap-3">
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
          </FormItem>
        )}
      />
    </div>
  )
}
