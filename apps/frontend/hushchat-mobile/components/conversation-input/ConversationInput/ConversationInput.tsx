import { forwardRef } from "react";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import ConversationInputMobile from "@/components/conversation-input/ConversationInput/ConversationInputMobile";
import ConversationInputWeb from "@/components/conversation-input/ConversationInput/ConversationInputWeb";
import { ConversationInputProps } from "@/types/chat/types";
import { PLATFORM } from "@/constants/platformConstants";

const ConversationInput = forwardRef<HTMLTextAreaElement | null, ConversationInputProps>(
  (props, ref) => {
    const isMobileLayout = useIsMobileLayout();
    const mobileSelected = !PLATFORM.IS_WEB && isMobileLayout;

    if (mobileSelected) {
      return <ConversationInputMobile {...props} />;
    }

    return <ConversationInputWeb {...props} ref={ref} />;
  }
);

ConversationInput.displayName = "ConversationInput";

export default ConversationInput;
