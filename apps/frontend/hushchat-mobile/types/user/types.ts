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

import * as yup from "yup";
import type { Asserts } from "yup";

export const UserSchema = yup.object({
  id: yup.string().nullable().notRequired(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().required(),
  active: yup.boolean().required(),
  signedImageUrl: yup.string().nullable().notRequired(),
});

export const RegisterUser = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  username: yup
    .string()
    .required("Username is required")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "username must contain only letters, numbers, and underscores, no spaces or other special characters",
    ),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  imageIndexedName: yup.string().notRequired(),
});

export type IUser = Asserts<typeof UserSchema>;
export type IRegisterUser = Asserts<typeof RegisterUser>;
export type IRegisterUserPayload = Omit<IRegisterUser, "confirmPassword">;

export type TUser = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  active?: boolean;
  conversationId?: number;
  signedImageUrl: string;
};

export type DeviceToken = {
  token: string;
  platform: "MOBILE" | "WEB";
};
