import { ContactUsForm } from "@/components/settings/contact/ContactUsForm.native";
import SettingsWrapper from "@/components/settings/Settings";
import { PLATFORM } from "@/constants/platformConstants";

export default function Contact() {
  if (PLATFORM.IS_WEB) {
    return (
      <SettingsWrapper>
        <ContactUsForm />
      </SettingsWrapper>
    );
  }

  return <ContactUsForm />;
}