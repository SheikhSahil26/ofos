import Joi from "joi";
import { AppError } from "../../../utils/appError";

export class UserValidation {

    // UUID validation
    static validateUserId(userId: string): void {

        const schema = Joi.string()
            .uuid()
            .required();

        const { error } = schema.validate(userId);

        if (error) {
            throw new AppError(
                `Invalid userId`,
                400
            );
        }
    }

    // update profile validation
    static validateUpdateProfile(data: {
        fullName?: string;
        mobile?: string;
    }): void {

        const schema = Joi.object({

            fullName: Joi.string()
                .trim()
                .min(2)
                .max(100)
                .optional(),

            mobile: Joi.string()
                .pattern(/^[6-9]\d{9}$/)
                .optional()
                .messages({
                    "string.pattern.base":
                        "Mobile number must be a valid 10 digit Indian mobile number"
                })

        })
        .or("fullName", "mobile");

        const { error } = schema.validate(data);

        if (error) {
            const errorMessage = error.details?.[0]?.message || error.message;
            throw new AppError(
                errorMessage,
                400
            );
        }
    }
}