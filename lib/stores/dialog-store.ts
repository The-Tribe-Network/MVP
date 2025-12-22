import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Consolidated dialog types from all pages
export type GlobalDialogType =
  | "image-preview"
  | "invite"
  | "tribe-members"
  | "event-preview"
  | "media-upload"
  | "delete-post"
  | "delete-comment"
  | "photo-carousel";

// Photo type for carousel dialog
export interface CarouselPhoto {
  id: string;
  url: string;
  caption: string;
  likes: number;
  comments: number;
  date?: string;
}

// Type-safe payload mapping for each dialog type
export type DialogPayloadMap = {
  "image-preview": { imageUrl: string; altText?: string };
  invite: { tribeId: string; tribeName: string };
  "tribe-members": { tribeId: string };
  "event-preview": { eventId: string };
  "media-upload": { tribeId: string };
  "delete-post": { tribeId: string; postId: string; postContent?: string };
  "delete-comment": {
    tribeId: string;
    postId: string;
    commentId: string;
    commentContent?: string;
  };
  "photo-carousel": {
    photos: CarouselPhoto[];
    initialIndex: number;
  };
};

export interface DialogState {
  isDialogOpen: boolean;
  selectedDialog: GlobalDialogType | null;
  dialogPayload: DialogPayloadMap[keyof DialogPayloadMap] | null;
}

export interface DialogActions {
  openDialog: <T extends GlobalDialogType>(
    dialog: T,
    payload: DialogPayloadMap[T]
  ) => void;
  closeDialog: () => void;
}

export interface DialogStore extends DialogState, DialogActions { }

const defaultInitialState: DialogState = {
  isDialogOpen: false,
  selectedDialog: null,
  dialogPayload: null,
};

export const useDialogStore = create<DialogStore>()(
  devtools(
    (set) => ({
      ...defaultInitialState,
      openDialog: (dialog, payload) =>
        set({
          isDialogOpen: true,
          selectedDialog: dialog,
          dialogPayload: payload,
        }),
      closeDialog: () =>
        set({
          isDialogOpen: false,
          selectedDialog: null,
          dialogPayload: null,
        }),
    }),
    {
      name: "dialog-store",
    }
  )
);

