import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { ToastUtils } from "@/utils/toastUtils";
import { useUserStore } from "@/store/user/useUserStore";
import { contactUsSchema } from "@/schema/contact-us";
import { sendContactUsMessage } from "@/apis/conversation";
import { useForm } from "@/hooks/useForm";

export function useContactUsForm() {
  const { user } = useUserStore();

  const initialValues = {
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    subject: "",
    message: "",
  };

  const form = useForm(contactUsSchema, initialValues);

  const sendMessage = useMutation({
    mutationFn: sendContactUsMessage,
    onSuccess: (response) => {
      ToastUtils.success(response.data || "Message sent successfully!");

      form.setValues(initialValues);
      form.clearErrors();
      form.setShowErrors(false);
    },
    onError: (error: any) => {
      ToastUtils.error(error.response?.data?.error || error.message);
    },
  });

  const handleSubmit = useCallback(async () => {
    const cleaned = await form.validateAll();
    if (!cleaned) return;

    const payload = {
      name: cleaned.name.trim(),
      email: cleaned.email.trim(),
      subject: cleaned.subject.trim(),
      message: cleaned.message.trim(),
    };

    sendMessage.mutate(payload);
  }, [form, sendMessage]);

  const isButtonDisabled =
    !form.values.name ||
    !form.values.email ||
    !form.values.subject ||
    !form.values.message ||
    sendMessage.isPending;

  return {
    form,
    handleSubmit,
    isPending: sendMessage.isPending,
    isButtonDisabled,
  };
}
