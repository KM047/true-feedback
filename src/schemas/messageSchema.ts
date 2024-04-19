import { z } from "zod";

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, { message: "Content should be at least 10 characters" })
        .max(300, { message: "Content should be at most 300 characters" }),
});
