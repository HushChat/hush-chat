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
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export const WorkspaceRegister = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  username: yup
    .string()
    .required("Username is required")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "username must contain only letters, numbers, and underscores, no spaces or other special characters"
    ),
  imageIndexedName: yup.string().notRequired(),
});

export const CreateWorkspace = yup.object({
  name: yup
    .string()
    .required("Workspace name is required")
    .max(50, "Workspace name must not exceed 50 characters")
    .matches(
      /^[a-zA-Z0-9\s_-]+$/,
      "Workspace name can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
  description: yup.string().notRequired().max(200, "Description must not exceed 200 characters"),
  imageUrl: yup.string().notRequired(),
});

export type IUser = Asserts<typeof UserSchema>;
export type IRegisterUser = Asserts<typeof RegisterUser>;
export type IRegisterUserPayload = Omit<IRegisterUser, "confirmPassword">;
export type IWorkspaceRegister = Asserts<typeof WorkspaceRegister>;
export type ICreateWorkspace = Asserts<typeof CreateWorkspace>;

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
