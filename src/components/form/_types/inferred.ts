import type { z } from "zod";
import type { FormConfig } from "./field-config";

export type InferredSchema<T extends FormConfig> = z.ZodObject<{
  [K in keyof T]: T[K]["constraint"];
}>;

export type InferredFormFields<T extends FormConfig> = z.infer<
  InferredSchema<T>
>;
