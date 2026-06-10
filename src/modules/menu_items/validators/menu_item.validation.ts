import Joi from "joi";

export const updateMenuItemSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .messages({
            "string.base": "Name must be a string",
            "string.empty": "Name cannot be empty",
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name cannot exceed 255 characters",
        }),

    description: Joi.string()
        .trim()
        .allow("", null)
        .messages({
            "string.base": "Description must be a string",
        }),

    price: Joi.number()
        .positive()
        .precision(2)
        .messages({
            "number.base": "Price must be a number",
            "number.positive": "Price must be greater than 0",
        }),

    isVeg: Joi.boolean().messages({
        "boolean.base": "isVeg must be a boolean",
    }),

    categoryId: Joi.string()
        .uuid()
        .messages({
            "string.guid": "Category ID must be a valid UUID",
        }),
})
.min(1)
.messages({
    "object.min": "At least one field is required for update",
});