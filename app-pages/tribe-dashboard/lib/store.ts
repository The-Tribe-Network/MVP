import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type TribeDashboardDialogType = 'image-preview' | 'invite' | 'event-preview' | 'tribe-members';

// Dialog payload types for each dialog
export type DialogPayload = {
  'image-preview': { imageUrl: string; altText?: string };
  'invite': { tribeId: string; tribeName: string };
  'event-preview': { eventId: string };
  'tribe-members': { tribeId: string };
};

export interface TribeDashboardState {
  isDialogOpen: boolean;
  selectedDialog: TribeDashboardDialogType | null;
  dialogPayload: DialogPayload[keyof DialogPayload] | null;
}

export interface TribeDashboardActions {
  openDialog: <T extends TribeDashboardDialogType>(
    dialog: T,
    payload: DialogPayload[T]
  ) => void;
  closeDialog: () => void;
}

export interface TribeDashboardStore extends TribeDashboardState, TribeDashboardActions { }

export const defaultInitialState: TribeDashboardState = {
  isDialogOpen: false,
  selectedDialog: null,
  dialogPayload: null,
}

export const createTribeDashboardStore = (
  initialState: TribeDashboardState = defaultInitialState,
) => {
  return create<TribeDashboardStore>()(
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
        name: "tribe-dashboard-store",
      },
    )
  )
}
