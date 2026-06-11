import Joi from "joi";

export const createModifierGroupSchema = Joi.object({
    menuItemId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid menu item ID",
            "string.empty": "Menu item ID is required",
            "any.required": "Menu item ID is required",
        }),

    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Modifier group name is required",
            "string.min": "Modifier group name must be at least 2 characters",
            "string.max": "Modifier group name cannot exceed 100 characters",
            "any.required": "Modifier group name is required",
        }),

    minSelection: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({
            "number.base": "Minimum selection must be a number",
            "number.integer": "Minimum selection must be an integer",
            "number.min": "Minimum selection cannot be less than 0",
        }),

    maxSelection: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            "number.base": "Maximum selection must be a number",
            "number.integer": "Maximum selection must be an integer",
            "number.min": "Maximum selection must be at least 1",
        }),

    isRequired: Joi.boolean()
        .default(false)
        .messages({
            "boolean.base": "isRequired must be true or false",
        }),
})
.custom((value, helpers) => {

    if (value.minSelection > value.maxSelection) {
        return helpers.error("any.invalid");
    }

    if (value.isRequired && value.minSelection === 0) {
        return helpers.message({
            custom: "Required modifier groups must have minSelection greater than 0",
        });
    }

    return value;
})
.messages({
    "any.invalid":
        "Minimum selection cannot be greater than maximum selection",
});

export const updateModifierGroupSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .messages({
            "string.empty": "Modifier group name cannot be empty",
            "string.min": "Modifier group name must be at least 2 characters",
            "string.max": "Modifier group name cannot exceed 100 characters",
        }),

    minSelection: Joi.number()
        .integer()
        .min(0)
        .messages({
            "number.base": "Minimum selection must be a number",
            "number.integer": "Minimum selection must be an integer",
            "number.min": "Minimum selection cannot be less than 0",
        }),

    maxSelection: Joi.number()
        .integer()
        .min(1)
        .messages({
            "number.base": "Maximum selection must be a number",
            "number.integer": "Maximum selection must be an integer",
            "number.min": "Maximum selection must be at least 1",
        }),

    isRequired: Joi.boolean()
        .messages({
            "boolean.base": "isRequired must be true or false",
        }),
})
.min(1)
.messages({
    "object.min": "At least one field must be provided for update",
});

export const createModifierOptionSchema = Joi.object({
    modifierGroupId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid modifier group ID",
            "any.required": "Modifier group ID is required",
        }),

    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Modifier option name is required",
            "string.min": "Modifier option name must be at least 2 characters",
            "string.max": "Modifier option name cannot exceed 100 characters",
            "any.required": "Modifier option name is required",
        }),

    extraPrice: Joi.number()
        .min(0)
        .default(0)
        .messages({
            "number.base": "Extra price must be a number",
            "number.min": "Extra price cannot be negative",
        }),
});

export const updateModifierOptionSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .messages({
            "string.empty": "Modifier option name cannot be empty",
            "string.min": "Modifier option name must be at least 2 characters",
            "string.max": "Modifier option name cannot exceed 100 characters",
        }),

    extraPrice: Joi.number()
        .min(0)
        .messages({
            "number.base": "Extra price must be a number",
            "number.min": "Extra price cannot be negative",
        }),
})
.min(1)
.messages({
    "object.min": "At least one field must be provided for update",
});
