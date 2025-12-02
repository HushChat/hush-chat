import * as Yup from "yup";
import { Asserts } from "yup";

export const inviteSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
});

export type IInvite = Asserts<typeof inviteSchema>;
