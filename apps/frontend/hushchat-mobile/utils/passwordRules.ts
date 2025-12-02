export interface PasswordRule {
  text: string;
  test: (value: string) => boolean;
  yupMessage: string;
  regex?: RegExp;
}

export const passwordRules: PasswordRule[] = [
  {
    text: "At least 8 characters",
    test: (v) => v.length >= 6,
    yupMessage: "Password must be at least 6 characters long",
  },
  {
    text: "At least one uppercase letter",
    test: (v) => /[A-Z]/.test(v),
    yupMessage: "Password must contain at least one uppercase letter",
    regex: /[A-Z]/,
  },
  {
    text: "At least one lowercase letter",
    test: (v) => /[a-z]/.test(v),
    yupMessage: "Password must contain at least one lowercase letter",
    regex: /[a-z]/,
  },
  {
    text: "At least one number",
    test: (v) => /\d/.test(v),
    yupMessage: "Password must contain at least one number",
    regex: /\d/,
  },
  {
    text: "At least one special character",
    test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
    yupMessage: "Password must contain at least one special character",
    regex: /[!@#$%^&*(),.?":{}|<>]/,
  },
];
