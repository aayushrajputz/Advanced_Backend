import { z } from "zod";

export const createOrderSchema = z.object({
    body: z.object({
        symbol: z.string().min(1, "Symbol is required"),
        type: z.enum(["LIMIT", "MARKET"]),
        quantity: z.number().positive("Quantity must be positive"),
        price: z.number().positive("Price must be positive").optional(),
        side: z.enum(["BUY", "SELL"])
    }).refine(data => {
        // LIMIT order check
        if (data.type === "LIMIT" && data.price === undefined) {
            return false;
        }
        return true;
    }, {
        message: "Price is required for LIMIT orders",
        path: ["price"]
    })
});
