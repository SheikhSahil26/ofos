import Joi from "joi";
import { AppError } from "../../../utils/appError";
import { ISignupDto } from "../../auth/interfaces/auth.interface";

export class RestaurantStaffValidation {

    // validate UUID
    static validateId(id: string, fieldName: string): void {

        const schema = Joi.string()
            .uuid()
            .required();

        const { error } = schema.validate(id);

        if (error) {
            throw new AppError(
                `Invalid ${fieldName}`,
                400
            );
        }
    }
    
    // add staff validation
    static validateAddStaff(data: ISignupDto): void {

        const schema = Joi.object({

            fullName: Joi.string()
                .trim()
                .min(2)
                .max(100)
                .required(),

            email: Joi.string()
                .trim()
                .lowercase()
                .email()
                .required(),

            mobile: Joi.string()
                .pattern(/^[6-9]\d{9}$/)
                .required()
                .messages({
                    "string.pattern.base":
                        "Mobile number must be a valid 10 digit Indian mobile number"
                }),

            password: Joi.string()
                .min(8)
                .max(50)
                .required(),

            confirmPassword: Joi.string()
                .required()
                .valid(Joi.ref("password"))
                .messages({
                    "any.only":
                        "Password and confirm password must match"
                })

        });

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