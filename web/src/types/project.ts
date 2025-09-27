import z from "zod";

export const projectItemZ = z.object({
  name: z.string(),
  baudRate: z.number(),
  sendMode: z.enum(["text", "hex"]),
  sendData: z.string(),
  receivedMode: z.enum(["text", "hex"]),
});
export type ProjectItemT = z.infer<typeof projectItemZ>;

export const projectZ = z.object({
  name: z.string(),
  items: z.array(projectItemZ),
});
export type ProjectT = z.infer<typeof projectZ>;
