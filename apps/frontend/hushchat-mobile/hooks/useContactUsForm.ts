import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as Yup from "yup";
import { sendContactUsMessage } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";
import { contactUsSchema } from "@/schemas/ContactUsSchema"; 

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface UseContactUsFormProps {
  initialName?: string;
  initialEmail?: string;
  onSuccessCallback?: () => void;
}

export function useContactUsForm({
  initialName = "",
  initialEmail = "",
  onSuccessCallback,
}: UseContactUsFormProps) {
  const [formData, setFormData] = useState<FormData>({
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
      setFormData({
        name: initialName,
        email: initialEmail,
        subject: "",
        message: "",
      });
      setErrors({});
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      ToastUtils.error(error.response?.data?.error || error.message);
    },
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    try {
      await contactUsSchema.validate(formData, { abortEarly: false }); 

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      mutation.mutate(payload);
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
