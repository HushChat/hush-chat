// import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

// import { PLATFORM } from "@/constants/platformConstants";
// import CallInterfaceMobile from "@/components/call-history/CallInterface/CallInterfaceMobile";
// import CallInterfaceWeb from "@/components/call-history/CallInterface/CallInterfaceWeb";
// import { CallLogComponentProps } from "@/types/call/types";

// const INTERFACE_COMPONENTS = {
//   mobile: CallInterfaceMobile,
//   web: CallInterfaceWeb,
// } as const;

// type InterfaceComponent = (typeof INTERFACE_COMPONENTS)[keyof typeof INTERFACE_COMPONENTS];

// export default function CallInterface(props: CallLogComponentProps) {
//   const isMobileLayout = useIsMobileLayout();

//   const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;

//   const SelectedComponent: InterfaceComponent = mobileSelected
//     ? INTERFACE_COMPONENTS.mobile
//     : INTERFACE_COMPONENTS.web;

//   return <SelectedComponent {...props} />;
// }

import React from "react";
import CallComingSoon from "@/components/call-history/CallInterface/CallComingSoon";

export default function CallInterface() {
  return <CallComingSoon />;
}
