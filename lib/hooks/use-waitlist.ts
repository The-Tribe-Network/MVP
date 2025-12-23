import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitWaitlist } from "@/lib/api/waitlist";
import { queryKeys } from "@/lib/constants/query-keys";
import { toast } from "sonner";
import type { WaitlistInput } from "@/lib/validations/waitlist";

export function useWaitlistSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitWaitlist,
    onSuccess: (data) => {
      toast.success(data.message || "Thanks for joining our waitlist!");
      queryClient.invalidateQueries({ queryKey: queryKeys.waitlist.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to join waitlist");
    },
  });
}
