"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type DefaultValues,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import type { z } from "zod";
import type { FormConfig, InferredFormFields } from "../_types";
import {
  generateSchema,
  getConfigDefaultValues,
  getSchemaDefaultValues,
} from "../_utils";

// type InferExtendReturnType<T extends FormConfig> = T extends {
//   extend: (schema: z.ZodSchema<InferredFormFields<T>>) => infer U;
// }
//   ? U extends CoreType<z.ZodSchema<InferredFormFields<T>>>
//     ? U
//     : never
//   : never;

// todo: make the return schema here be wrapped with ZodEffects, Pipes and what not
export type UseInferredFormAdditionalParams<T extends FormConfig> = {
  defaultValues?: Partial<InferredFormFields<T>>;
  extend?: (
    schema: z.ZodSchema<InferredFormFields<T>>,
  ) => z.ZodSchema<InferredFormFields<T>>;
  hideFormFields?: (
    data: InferredFormFields<T>,
  ) => Partial<Record<keyof InferredFormFields<T>, boolean>>;
  props?: Partial<
    Omit<
      UseFormProps<InferredFormFields<T>>,
      "resolver" | "defaultValues" | "shouldUnregister"
    >
  >;
};

export type UseInferredFormWithHideField<T extends FormConfig> = UseFormReturn<
  InferredFormFields<T>
> & {
  shouldHideField: (fieldName: keyof T, data: InferredFormFields<T>) => boolean;
  // shouldHideField: (fieldName: string, data: unknown) => boolean;
};

export function useInferredForm<T extends FormConfig>(
  config: T,
  params: UseInferredFormAdditionalParams<T> & {
    hideFormFields: (
      data: InferredFormFields<T>,
    ) => Partial<Record<keyof InferredFormFields<T>, boolean>>;
  },
): UseInferredFormWithHideField<T>;

export function useInferredForm<T extends FormConfig>(
  config: T,
  params?: UseInferredFormAdditionalParams<T>,
): UseFormReturn<InferredFormFields<T>>;

export function useInferredForm<T extends FormConfig>(
  config: T,
  {
    defaultValues,
    extend,
    hideFormFields,
    props = {},
  }: UseInferredFormAdditionalParams<T> = {},
) {
  const schema = generateSchema(config);
  const extendedSchema = extend?.(schema) ?? schema;

  const form = useForm<InferredFormFields<T>>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      ...getSchemaDefaultValues(schema),
      ...getConfigDefaultValues(config),
      ...defaultValues,
    } as DefaultValues<InferredFormFields<T>>,
    shouldUnregister: !!hideFormFields,
    ...props,
  });

  if (hideFormFields) {
    const shouldHideField = (
      fieldName: keyof T,
      data: InferredFormFields<T>,
    ): boolean => {
      return hideFormFields(data)?.[fieldName] ?? false;
    };

    return {
      ...form,
      shouldHideField,
    };
  }

  return form;
}

export type UseInferredFormParams<T extends FormConfig> = Parameters<
  typeof useInferredForm<T>
>;
