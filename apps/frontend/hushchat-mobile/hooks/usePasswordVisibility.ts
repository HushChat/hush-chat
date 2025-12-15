import { useState, useCallback } from "react";

interface IPasswordVisibilityState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

const initialState: IPasswordVisibilityState = {
  current: false,
  new: false,
  confirm: false,
};

export function usePasswordVisibility() {
  const [visibility, setVisibility] = useState<IPasswordVisibilityState>(initialState);

  const toggleCurrent = useCallback(() => {
    setVisibility((prev) => ({ ...prev, current: !prev.current }));
  }, []);

  const toggleNew = useCallback(() => {
    setVisibility((prev) => ({ ...prev, new: !prev.new }));
  }, []);

  const toggleConfirm = useCallback(() => {
    setVisibility((prev) => ({ ...prev, confirm: !prev.confirm }));
  }, []);

  const getIconName = (isVisible: boolean): string => {
    return isVisible ? "eye-off" : "eye";
  };

  return {
    showCurrentPassword: visibility.current,
    showNewPassword: visibility.new,
    showConfirmPassword: visibility.confirm,
    toggleCurrentPassword: toggleCurrent,
    toggleNewPassword: toggleNew,
    toggleConfirmPassword: toggleConfirm,
    getIconName,
  };
}
