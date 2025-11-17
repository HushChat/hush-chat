import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnySchema } from 'yup';

interface ErrorCollection extends Record<string, any> {}

export default function useValidation(schema: AnySchema, values: null | object) {
  const ref = useRef<null | string>(null);

  const [validationErrors, setValidationErrors] = useState<ErrorCollection | null>(null);

  const runValidation = useCallback(
    (currentValue: unknown, currentSchema: AnySchema) =>
      currentSchema
        .validate(currentValue, { abortEarly: false })
        .then(() => setValidationErrors(null))
        .catch((validationResult) => {
          const { inner }: { inner: never[] } = validationResult;
          const errorObject = inner?.reduce(
            (parsedErrors, { path, errors }) => ({
              ...parsedErrors,
              [path]: errors,
            }),
            {},
          );
          setValidationErrors(errorObject);
          return errorObject;
        }),
    [],
  );
  useEffect(() => {
    const valuesString = JSON.stringify(values);

    if (ref.current !== valuesString) {
      ref.current = valuesString;
      runValidation(values, schema);
    }
  }, [values, schema, runValidation]);

  return [validationErrors];
}
