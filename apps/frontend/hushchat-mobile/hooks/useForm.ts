import { useCallback, useMemo, useState } from 'react';
import type * as yup from 'yup';

export type YupFormState<T extends Record<string, any>> = {
  values: T;
  errors: Record<string, string>;
  showErrors: boolean;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  setFieldValue: (name: string, value: any) => void;
  onValueChange: (args: { name: string; value: any }) => void;
  setShowErrors: React.Dispatch<React.SetStateAction<boolean>>;
  clearErrors: () => void;
  validateAll: () => Promise<T | null>;
};

export function useForm<T extends Record<string, any>>(
  schema: yup.ObjectSchema<any>,
  initialValues: T,
): YupFormState<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onValueChange = useCallback(
    ({ name, value }: { name: string; value: any }) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        schema
          .validateAt(String(name), next)
          .then(() => {
            setErrors((prevErrs) => {
              if (!prevErrs[String(name)]) return prevErrs;
              const updated = { ...prevErrs };
              delete updated[String(name)];
              return updated;
            });
          })
          .catch((err: any) => {
            setErrors((prevErrs) => ({
              ...prevErrs,
              [String(name)]: err?.message || 'Invalid value',
            }));
          });
        return next as T;
      });
    },
    [schema],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  const validateAll = useCallback(async (): Promise<T | null> => {
    setShowErrors(true);
    try {
      const clean = (await schema.validate(values, { abortEarly: false })) as T;
      setErrors({});
      return clean;
    } catch (e: any) {
      const next: Record<string, string> = {};
      if (e?.inner?.length) {
        e.inner.forEach((issue: any) => {
          if (issue.path && !next[issue.path]) next[issue.path] = issue.message;
        });
      } else if (e?.path) {
        next[e.path] = e.message;
      }
      setErrors(next);
      return null;
    }
  }, [schema, values]);

  return useMemo(
    () => ({
      values,
      errors,
      showErrors,
      setValues,
      setFieldValue,
      onValueChange,
      setShowErrors,
      clearErrors,
      validateAll,
    }),
    [
      values,
      errors,
      showErrors,
      setValues,
      setFieldValue,
      onValueChange,
      setShowErrors,
      clearErrors,
      validateAll,
    ],
  );
}
