import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { ToastUtils } from "@/utils/toastUtils";
import { useUserStore } from "@/store/user/useUserStore";
import { contactUsSchema } from "@/schema/contact-us";
import { sendContactUsMessage } from "@/apis/conversation";
import { useForm } from "@/hooks/useForm";

interface IAttachmentPayload {
  originalFileName: string;
  indexedFileName: string;
}

export function useContactUsForm() {
  const { user } = useUserStore();

  const defaultContactFormValues = {
    name: `${user.firstName} ${user.lastName}`,
    email: user?.email || "",
    subject: "",
    message: "",
  };

  const contactForm = useForm(contactUsSchema, defaultContactFormValues);

  const contactMessageMutation = useMutation({
    mutationFn: sendContactUsMessage,
    onSuccess: (response) => {
      ToastUtils.success(response.data || "Message sent successfully!");

      contactForm.setValues(defaultContactFormValues);
      contactForm.clearErrors();
      contactForm.setShowErrors(false);
    },
    onError: (error: any) => {
      ToastUtils.error(error.response?.data?.error || error.message);
    },
  });

  const submitContactForm = useCallback(
    async (attachments: IAttachmentPayload[] = []) => {
      const validatedContactData = await contactForm.validateAll();
      if (!validatedContactData) return;

      const contactMessagePayload = {
        name: validatedContactData.name.trim(),
        email: validatedContactData.email.trim(),
        subject: validatedContactData.subject.trim(),
        message: validatedContactData.message.trim(),
        attachments,
      };

      contactMessageMutation.mutate(contactMessagePayload);
    },
    [contactForm, contactMessageMutation]
  );

  const isSubmitButtonDisabled =
    !contactForm.values.name ||
    !contactForm.values.email ||
    !contactForm.values.subject ||
    !contactForm.values.message ||
    contactMessageMutation.isPending;

  return {
    contactForm,
    submitContactForm,
    isPending: contactMessageMutation.isPending,
    isSubmitButtonDisabled,
  };
}
