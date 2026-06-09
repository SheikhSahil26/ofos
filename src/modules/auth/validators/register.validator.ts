//add zod validations here

import Joi from "joi";

export const signupSchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .required()
        .messages({
            "string.empty": "Full name is required",
            "string.min": "Full name must be at least 3 characters",
            "string.max": "Full name cannot exceed 255 characters",
            "any.required": "Full name is required",
        }),

    email: Joi.string()
        .trim()
        .email()
        .max(255)
        .required()
        .messages({
            "string.email": "Please provide a valid email address",
            "string.empty": "Email is required",
            "any.required": "Email is required",
        }),

    mobile: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.pattern.base": "Mobile number must contain exactly 10 digits",
            "string.empty": "Mobile number is required",
            "any.required": "Mobile number is required",
        }),

    password: Joi.string()
        .min(8)
        .max(50)
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
        )
        .required()
        .messages({
            "string.min":
                "Password must contain at least 8 characters",
            "string.max":
                "Password cannot exceed 50 characters",
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character",
            "any.required":
                "Password is required",
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Confirm password is required",
        }),
});