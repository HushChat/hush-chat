import * as yup from "yup";
import type { Asserts } from "yup";
import { passwordRules } from '@/utils/passwordRules';

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
      "username must contain only letters, numbers, and underscores, no spaces or other special characters"
    ),
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
  imageIndexedName: yup.string().notRequired(),
});

export const ProfileUpdateSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
});

// Password Change Schema
export const PasswordChangeSchema = yup
  .object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: passwordRules.reduce(
      (schema, rule) =>
        rule.regex
          ? schema.matches(rule.regex, rule.yupMessage)
          : schema.test('password-rule', rule.yupMessage, (value) =>
              value ? rule.test(value) : false,
            ),
      yup.string().required('New password is required'),
    ),
    confirmPassword: yup
      .string()
      .required('Please confirm your password')
      .oneOf([yup.ref('newPassword')], 'Passwords must match'),
  })
  .test(
    'different-passwords',
    'New password must be different from current password',
    function (values) {
      const { currentPassword, newPassword } = values;
      if (currentPassword && newPassword && currentPassword === newPassword) {
        return this.createError({
          path: 'newPassword',
          message: 'New password must be different from your current password',
        });
      }
      return true;
    },
  );

export type PasswordChangeFormData = Asserts<typeof PasswordChangeSchema>;
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
