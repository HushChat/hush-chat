import InviteForm from "@/components/settings/invite/InviteForm";
import SettingsWrapper from "@/components/settings/Settings";
import { PLATFORM } from "@/constants/platformConstants";

export default function Invite() {
  if (PLATFORM.IS_WEB) {
    return (
      <SettingsWrapper>
        <InviteForm />
      </SettingsWrapper>
    );
  }

  return <InviteForm />;
}
