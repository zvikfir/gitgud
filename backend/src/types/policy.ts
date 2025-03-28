export type PolicyCriteria = {
  events: string[],
}

export type Policy = {
  id: string,
  enabled: boolean,
  draft: boolean,
  ordinal: number,
  tags: string[],
  badge: string,
  criteria: PolicyCriteria,
  requires: string[],
  title: string,
  description: string,
  help: string,
  qualified: any,
  result: "fulfilled" | "not-fulfilled" | "not-qualified";
  handle: (context: any, project: any, payload: any) => Promise<boolean>,
}
