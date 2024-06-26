import { z } from "zod";

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, "Content should be atleast 10 characters long")
        .max(300, "Content should be atmost 300 characters long"),
});