import { useForm } from "@/hooks/useForm";
import { inviteSchema } from "@/schema/invite";
import { useMutation } from "@tanstack/react-query";
import { sendInviteToWorkspace } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";

export function useInviteForm(formData: { email: string }) {
  const inviteForm = useForm(inviteSchema, formData);

  const inviteMutation = useMutation({
    mutationFn: sendInviteToWorkspace,
    onSuccess: () => {
      ToastUtils.success("Invite sent successfully!");
    },
    onError: (error: any) => {
      ToastUtils.error(error.response?.data?.error || error.message);
    },
  });

  return { inviteForm, inviteMutation };
}
