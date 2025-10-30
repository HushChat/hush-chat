/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ReactNode } from "react";

type TCallParticipant = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
  leftAt: string;
};

export const CallStatus = {
  ANSWERED: "ANSWERED",
  MISSED: "MISSED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
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
  incoming: "incoming",
  outgoing: "outgoing",
} as const;

export type Direction = keyof typeof CallDirection;
