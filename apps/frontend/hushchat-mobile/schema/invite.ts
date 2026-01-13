import * as Yup from "yup";

export const inviteSchema = Yup.object().shape({
  invites: Yup.array()
    .of(
      Yup.object().shape({
        email: Yup.string()
          .email("Invalid email format")
          .required("Email is required")
          .test("unique", "Duplicate email address", function (value) {
            const { options } = this;
            const allInvites =
              (options.context as any)?.values?.invites || (this as any).from[1].value.invites;

            if (!value || !allInvites) return true;

            const duplicateCount = allInvites.filter(
              (item: any) => item.email?.toLowerCase() === value.toLowerCase()
            ).length;

            return duplicateCount <= 1;
          }),
      })
    )
    .min(1, "At least one invite is required"),
});

export type IInviteFormValues = Yup.InferType<typeof inviteSchema>;
