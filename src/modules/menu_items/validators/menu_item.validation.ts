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

export const updateAvailabilitySchema = Joi.object({
    isAvailable: Joi.boolean()
        .required()
        .messages({
            "any.required":
                "isAvailable is required",
            "boolean.base":
                "isAvailable must be a boolean",
        }),
});

export const updateBestsellerSchema = Joi.object({
    isBestseller: Joi.boolean()
        .required()
        .messages({
            "any.required":
                "isBestseller is required",
            "boolean.base":
                "isBestseller must be a boolean",
        }),
});

export const addDietaryTagsSchema = Joi.object({
    tagIds: Joi.array()
        .items(
            Joi.string()
                .uuid()
                .required()
        )
        .min(1)
        .required()
        .messages({
            "array.base":
                "tagIds must be an array",
            "array.min":
                "At least one tag is required",
            "any.required":
                "tagIds is required",
        }),
});