import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Album } from "@/lib/hooks/use-albums";
import { capitalize } from "@/lib/utils";

interface NewPostAlbumToggleProps {
  imagePreview: string | null;
  addToAlbum: boolean;
  setAddToAlbum: (addToAlbum: boolean) => void;
  isDisabled: boolean;
  selectedAlbumId: string | null;
  setSelectedAlbumId: (selectedAlbumId: string | null) => void;
  albums: Album[];
  isLoadingAlbums: boolean;
}
export default function NewPostAlbumToggle({ imagePreview, addToAlbum, setAddToAlbum, isDisabled, selectedAlbumId, setSelectedAlbumId, albums, isLoadingAlbums }: NewPostAlbumToggleProps) {
  if (!imagePreview) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Add to album</p>
        <Switch
          id="add-to-album"
          checked={addToAlbum}
          onCheckedChange={setAddToAlbum}
          disabled={isDisabled}
        />
      </div>

      {addToAlbum && (
        <div className="flex items-center gap-2">
          <Select
            value={selectedAlbumId || "general"}
            onValueChange={(value) => setSelectedAlbumId(value === "general" ? null : value)}
            disabled={isDisabled || isLoadingAlbums}
          >
            <SelectTrigger id="album-select" className="w-full">
              <SelectValue placeholder="Select an album" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              {albums && albums.length > 0 && (
                <>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {capitalize(album.name)}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}