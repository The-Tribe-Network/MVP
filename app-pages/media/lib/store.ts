import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DialogPayloadSchema } from "./schemas";
import { z } from "zod";


export type TribeMediaPageDialogType = keyof DialogPayloadSchema;

export type DialogPayload = {
  [K in TribeMediaPageDialogType]: z.infer<DialogPayloadSchema[K]>;
};

export interface TribeMediaPageState {
  isDialogOpen: boolean;
  selectedDialog: TribeMediaPageDialogType | null;
  dialogPayload: DialogPayload[keyof DialogPayload] | null;
}

export interface TribeMediaPageActions {
  openDialog: <T extends TribeMediaPageDialogType>(
    dialog: T,
    payload: DialogPayload[T]
  ) => void;
  closeDialog: () => void;
}

export interface TribeMediaPageStore extends TribeMediaPageState, TribeMediaPageActions { }

export const defaultInitialState: TribeMediaPageState = {
  isDialogOpen: false,
  selectedDialog: null,
  dialogPayload: null,
}

export const createTribeMediaPageStore = (
  initialState: TribeMediaPageState = defaultInitialState,
) => {
  return create<TribeMediaPageStore>()(
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
        name: "tribe-media-page-store",
      },
    )
  )
}