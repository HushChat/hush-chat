import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { contactUsSchema } from "@/schemas/ContactUsSchema";
import { sendContactUsMessage } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";
import * as Yup from "yup";

export function useContactUsForm(initialName = "", initialEmail = "") {
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: sendContactUsMessage,
    onSuccess: (response) => {
      ToastUtils.success(response.data || "Message sent successfully!");
      resetForm();
    },
    onError: (error: any) => {
      ToastUtils.error(error.response?.data?.error || error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: initialName,
      email: initialEmail,
      subject: "",
      message: "",
    });
    setErrors({});
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await contactUsSchema.validate(formData, { abortEarly: false });
      setErrors({});
      mutation.mutate({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) validationErrors[e.path] = e.message;
        });
        setErrors(validationErrors);
      }
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.subject.trim() &&
    formData.message.trim();

  return {
    formData,
    errors,
    mutation,
    handleChange,
    handleSubmit,
    isFormValid,
  };
}
