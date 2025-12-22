import { MapPin, Users, Lock, Globe, TrendingUp, Sparkles } from 'lucide-react';
import { getLocationDisplayName } from '@/lib/utils/location';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { DiscoverTribe } from '@/app-pages/discover/lib/types';

interface TribeCardProps {
  tribe: DiscoverTribe;
  featured?: boolean;
}

export function TribeCard({ tribe, featured = false }: TribeCardProps) {
  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 ${featured ? 'border-primary/50' : ''}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <Avatar className={featured ? 'w-16 h-16' : 'w-12 h-12'}>
            <AvatarImage src={tribe.avatar || "/placeholder.svg"} />
            <AvatarFallback>{tribe.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            {tribe.trending && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Trending
              </Badge>
            )}
            {tribe.featured && (
              <Badge variant="default" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <div>
          <CardTitle className="text-lg mb-1">{tribe.name}</CardTitle>
          <CardDescription className={featured ? 'text-sm' : 'text-xs line-clamp-2'}>
            {tribe.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{tribe.memberCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{getLocationDisplayName(tribe.location)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tribe.isPublic ? (
            <Badge variant="outline" className="gap-1">
              <Globe className="w-3 h-3" />
              Public
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Lock className="w-3 h-3" />
              Private
            </Badge>
          )}
          <Badge variant="secondary">{tribe.category}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={tribe.isPublic ? 'default' : 'outline'}>
          {tribe.isPublic ? 'Join Tribe' : 'Request to Join'}
        </Button>
      </CardFooter>
    </Card>
  );
}

