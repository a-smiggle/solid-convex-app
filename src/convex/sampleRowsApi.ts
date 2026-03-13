import type { DefaultFunctionArgs, FunctionReference } from "convex/server";

export type SampleRowStatus = "new" | "processing" | "done";

export type SampleRowRecord = {
  _id: string;
  _creationTime: number;
  label: string;
  status: SampleRowStatus;
  createdAt: number;
};

type PublicQuery<Args extends DefaultFunctionArgs, ReturnValue> = FunctionReference<"query", "public", Args, ReturnValue>;
type PublicMutation<Args extends DefaultFunctionArgs, ReturnValue> = FunctionReference<"mutation", "public", Args, ReturnValue>;

export const sampleRowsApi = {
  list: "sampleRows:list" as unknown as PublicQuery<Record<string, never>, SampleRowRecord[]>,
  add: "sampleRows:add" as unknown as PublicMutation<{ label: string }, string>,
};