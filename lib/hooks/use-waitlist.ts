import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitWaitlist, submitWaitlistSurvey } from "@/lib/api/waitlist";
import { queryKeys } from "@/lib/constants/query-keys";
import { toast } from "sonner";

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

export function useWaitlistSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitWaitlistSurvey,
    onSuccess: (data) => {
      if (data.alreadySubmitted) {
        toast.info("You've already completed this survey. Thank you!");
      } else {
        toast.success(data.message || "Thank you for completing the survey!");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.waitlist.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit survey");
    },
  });
}
