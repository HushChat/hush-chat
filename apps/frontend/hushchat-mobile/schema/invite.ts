import * as Yup from "yup";

export const inviteSchema = Yup.object().shape({
  emails: Yup.array()
    .of(Yup.string().trim().email("Invalid email format").required("Email cannot be empty"))
    .min(1, "Add at least one email address")
    .max(100, "Maximum 100 invites allowed")
    .test("unique-emails", "Duplicate email addresses are not allowed", function (value) {
      if (!value || value.length === 0) return true;

      const lowercased = value.map((email) => email?.toLowerCase().trim());
      const uniqueSet = new Set(lowercased);

      return uniqueSet.size === lowercased.length;
    }),
});

export type IInviteFormValues = Yup.InferType<typeof inviteSchema>;
