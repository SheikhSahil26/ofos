import Joi from "joi";

export const createMenuItemSchema = Joi.object({
    branchId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid branch ID",
            "any.required": "Branch ID is required",
        }),

    categoryId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid category ID",
            "any.required": "Category ID is required",
        }),

    name: Joi.string()
        .trim()
        .max(255)
        .required()
        .messages({
            "string.empty": "Menu item name is required",
            "any.required": "Menu item name is required",
        }),

    description: Joi.string()
        .allow("")
        .optional(),

    price: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "Price must be a number",
            "number.positive": "Price must be greater than 0",
            "any.required": "Price is required",
        }),

    isVeg: Joi.boolean()
        .optional(),

    imageUrl: Joi.string()
        .uri()
        .optional(),

   tagIds: Joi.array()
    .items(
        Joi.string().uuid().messages({
            "string.guid": "Invalid dietary tag ID",
        })
    )
    .single()
    .optional(),

    isAvailable: Joi.boolean().optional(),

    isBestseller: Joi.boolean().optional(), 
});

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