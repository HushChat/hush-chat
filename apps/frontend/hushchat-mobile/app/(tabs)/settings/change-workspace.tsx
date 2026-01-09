import ChangeWorkspaceForm from "@/components/settings/change-workspace/ChangeWorkspaceForm";
import InviteForm from "@/components/settings/invite/InviteForm";
import SettingsWrapper from "@/components/settings/Settings";
import { PLATFORM } from "@/constants/platformConstants";

export default function ChangeWorkspace() {
  if (PLATFORM.IS_WEB) {
    return (
      <SettingsWrapper>
        <ChangeWorkspaceForm />
      </SettingsWrapper>
    );
  }

  return <InviteForm />;
}