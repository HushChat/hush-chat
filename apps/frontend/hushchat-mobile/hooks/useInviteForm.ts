import { useForm } from "@/hooks/useForm";
import { inviteSchema, IInviteFormValues } from "@/schema/invite";
import { ToastUtils } from "@/utils/toastUtils";
import { useSendInviteMutation } from "@/query/post/queries";

const INITIAL_VALUES: IInviteFormValues = {
  emails: [],
};

export function useInviteForm(initialData = INITIAL_VALUES) {
  const inviteForm = useForm(inviteSchema, initialData);

  const inviteMutation = useSendInviteMutation(
    {},
    () => {
      ToastUtils.success("Invites sent successfully!");
      inviteForm.setValues(INITIAL_VALUES);
    },
    (error: any) => {
      ToastUtils.error(error?.message || "Failed to send invites");
    }
  );

  return { inviteForm, inviteMutation };
}
