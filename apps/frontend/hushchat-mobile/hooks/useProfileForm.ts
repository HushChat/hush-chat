import { useCallback, useState } from "react";
import { useForm } from "@/hooks/useForm";
import { ProfilePasswordSchema } from "@/types/user/types";
import type { TProfileFormProps } from "@/types/login/types";
import { useUpdateUserMutation } from "@/query/patch/queries";
import { useChangePasswordQuery } from "@/query/post/queries";
import { ToastUtils } from "@/utils/toastUtils";
import { useUserStore } from "@/store/user/useUserStore";
import {
  getImagePickerAsset,
  uploadImage,
  uploadImageToSignedUrl,
  UploadType,
} from "@/apis/photo-upload-service/photo-upload-service";
import { ImagePickerResult } from "expo-image-picker/src/ImagePicker.types";

export function useProfileForm() {
  const { user, fetchUserData } = useUserStore();
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imagePickerResult, setImagePickerResult] = useState<ImagePickerResult | null>(null);
  const [imageAssetData, setImageAssetData] = useState({
    fileUri: "",
    fileName: "",
    fileType: "",
  });

  const { values, errors, showErrors, onValueChange, validateAll, setShowErrors, setValues } =
    useForm<TProfileFormProps>(ProfilePasswordSchema, {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const changeUserPassword = useChangePasswordQuery(
    () => {
      ToastUtils.success("Password updated successfully");
      // Reset password fields
      setValues((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setShowErrors(false);
    },
    (error: any) => {
      ToastUtils.error(error?.message ?? "Something went wrong");
    }
  );

  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUserMutation(
    { userId: Number(user?.id) },
    (user) => {
      const imageSignedUrl = user.signedImageUrl;

      if (imageSignedUrl && imageAssetData !== null) {
        uploadImageToSignedUrl(imageAssetData?.fileUri, imageSignedUrl);
      }

      fetchUserData();
      ToastUtils.success("Profile updated successfully");
    }
  );

  const hasPasswordData = useCallback((): boolean => {
    return !!(values.currentPassword || values.newPassword || values.confirmPassword);
  }, [values.currentPassword, values.newPassword, values.confirmPassword]);

  const isProfileChanged = useCallback((): boolean => {
    return (
      values.firstName.trim() !== user?.firstName ||
      values.lastName.trim() !== user?.lastName ||
      !!imagePickerResult
    );
  }, [values.firstName, values.lastName, user?.firstName, user?.lastName, imagePickerResult]);

  const uploadImageResult = async () => {
    setUploading(true);
    const pickerResult = await uploadImage();
    setImagePickerResult(pickerResult ?? null);
    setUploading(false);
  };

  const submit = useCallback(async () => {
    setShowErrors(true);

    // Validate all fields
    const validated = await validateAll();
    if (!validated) {
      ToastUtils.error("Please fix validation errors");
      return;
    }

    let hasChanges = false;

    // Handle profile updates (name or image changes)
    const hasProfileChanges = isProfileChanged();

    if (hasProfileChanges) {
      hasChanges = true;

      const imageData = imagePickerResult
        ? getImagePickerAsset(imagePickerResult, UploadType.PROFILE)
        : null;

      if (imageData) setImageAssetData(imageData);

      updateUser({
        id: user?.id ?? "",
        firstName: validated.firstName.trim(),
        lastName: validated.lastName.trim(),
        imageFileName: imageData ? imageData.fileName : null,
      });
    }

    // Handle password update
    if (hasPasswordData()) {
      hasChanges = true;

      changeUserPassword.mutate({
        currentPassword: validated.currentPassword,
        newPassword: validated.newPassword,
      });
    }

    if (!hasChanges) {
      ToastUtils.info("No changes to update");
    }
  }, [
    validateAll,
    setShowErrors,
    isProfileChanged,
    hasPasswordData,
    imagePickerResult,
    user?.id,
    updateUser,
    changeUserPassword,
  ]);

  // Sync form values when user data changes
  const syncUserData = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    }));
    setImageError(false);
  }, [user?.firstName, user?.lastName, setValues]);

  return {
    formValues: values,
    formErrors: errors,
    showErrors,
    onValueChange,
    submit,
    isLoading: isUpdatingUser || changeUserPassword.isPending,
    uploading,
    setUploading,
    imageError,
    setImageError,
    imagePickerResult,
    setImagePickerResult,
    uploadImageResult,
    syncUserData,
    hasPasswordData: hasPasswordData(),
    isProfileChanged: isProfileChanged(),
  };
}
