import { Images } from "@/assets/images";
import Placeholder from "@/components/Placeholder";

export default function ConversationsIndexScreen() {
  return (
    <Placeholder
      title="No chat selected"
      subtitle="Choose a conversation to start chatting"
      image={Images.NoChatSelected}
    />
  );
}
