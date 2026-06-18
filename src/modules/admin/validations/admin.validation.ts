import Joi from "joi";

export const updateUserStatusSchema = Joi.object({
    isActive: Joi.boolean()
        .required()
        .messages({
            "any.required": "Status is required",
            "boolean.base": "Status must be true or false",
        }),

    reason: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .required()
        .messages({
            "string.empty": "Reason is required",
            "string.min": "Reason must be at least 5 characters",
            "string.max": "Reason cannot exceed 255 characters",
            "any.required": "Reason is required",
        }),
});

export const assignRoleSchema = Joi.object({
    roleId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.empty": "Role id is required",
            "any.required": "Role id is required",
        }),
});