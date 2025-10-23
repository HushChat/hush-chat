import { ReactNode } from 'react';

type TCallParticipant = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
  leftAt: string;
};

export const CallStatus = {
  ANSWERED: 'ANSWERED',
  MISSED: 'MISSED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

type TCallStatus = keyof typeof CallStatus;

export interface ICallLog {
  callLogId: number;
  conversationId: number;
  initiator: TCallParticipant;
  isVideo: boolean;
  status: TCallStatus;
  callStartedAt: string;
  callEndedAt: string;
  participants: TCallParticipant[];
}

type IFilter = {
  title: string;
  isActive: boolean;
};

export interface CallLogComponentProps {
  callItemList: ReactNode;
  refetchCallLogs: () => void;
  isCallLogsLoading: boolean;
  filters: IFilter[];
}

export const CallDirection = {
  incoming: 'incoming',
  outgoing: 'outgoing',
} as const;

export type Direction = keyof typeof CallDirection;
