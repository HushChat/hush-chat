import { chatUserStatus } from "../chat/types";

export enum WorkspaceUserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export interface IWorkspaceUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  signedImageUrl: string;
  status: WorkspaceUserStatus;
  conversationId: number;
  chatUserStatus: chatUserStatus;
  contactNumber: string;
  address: string;
  designation: string;
}
