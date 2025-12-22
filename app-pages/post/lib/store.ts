import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DialogPayloadSchema } from "./schemas";
import { z } from "zod";

export type PostDetailDialogType = keyof DialogPayloadSchema;

export type DialogPayload = {
  [K in PostDetailDialogType]: z.infer<DialogPayloadSchema[K]>;
};

export interface PostDetailPageState {
  isDialogOpen: boolean;
  selectedDialog: PostDetailDialogType | null;
  dialogPayload: DialogPayload[keyof DialogPayload] | null;
}

export interface PostDetailPageActions {
  openDialog: <T extends PostDetailDialogType>(
    dialog: T,
    payload: DialogPayload[T]
  ) => void;
  closeDialog: () => void;
}

export interface PostDetailPageStore extends PostDetailPageState, PostDetailPageActions {}

export const defaultInitialState: PostDetailPageState = {
  isDialogOpen: false,
  selectedDialog: null,
  dialogPayload: null,
}

export const createPostDetailPageStore = (
  initialState: PostDetailPageState = defaultInitialState,
) => {
  return create<PostDetailPageStore>()(
    devtools(
      (set) => ({
        ...initialState,
        openDialog: (dialog, payload) => set({
          isDialogOpen: true,
          selectedDialog: dialog,
          dialogPayload: payload,
        }),
        closeDialog: () => set({
          isDialogOpen: false,
          selectedDialog: null,
          dialogPayload: null,
        }),
      }),
      {
        name: "post-detail-page-store",
      },
    )
  )
}
