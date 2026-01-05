import { useEffect } from "react";
import { useLogout } from "@/hooks/useLogout";

interface SecurityActionDetail {
  status: number;
  message: string;
  action: string | null;
  url: string;
  uniqueId: string;
}

export const useSecurityActionHandler = () => {
  const { handleLogout } = useLogout();

  useEffect(() => {
    const handleSecurityAction = (event: Event) => {
      const customEvent = event as CustomEvent<SecurityActionDetail>;
      const { status } = customEvent.detail;

      if (status === 412) {
        handleLogout();
      }
    };

    window.addEventListener("api-security-action", handleSecurityAction);

    return () => {
      window.removeEventListener("api-security-action", handleSecurityAction);
    };
  }, []);
};
