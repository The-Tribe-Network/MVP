export type PrivacyType = 'public' | 'private' | 'admin_only'

export type CoverMode = 'none' | 'upload' | 'select'

export interface UploadedMediaPreview {
  id: string
  url: string
  file: File
  uploadProgress?: number
  isUploading?: boolean
}
