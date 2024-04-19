import { z } from "zod";

export const verifyCodeSchema = z.string().length(6, {
    message: "Verification code must be at least 6 digits",
});
