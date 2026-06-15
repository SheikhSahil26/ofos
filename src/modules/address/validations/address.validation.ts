import Joi from "joi";
import { AppError } from "../../../utils/appError";
import {
    ICreateAddress,
    IUpdateAddress
} from "../interfaces/address.interface";

export class AddressValidation {

    static validateId(
        id: string,
        fieldName: string
    ): void {

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

    static validateCreateAddress(
        data: ICreateAddress
    ): void {

        const schema = Joi.object({

            label: Joi.string()
                .trim()
                .min(2)
                .max(50)
                .required(),

            addressLine1: Joi.string()
                .trim()
                .min(5)
                .max(255)
                .required(),

            addressLine2: Joi.string()
                .trim()
                .max(255)
                .allow("")
                .optional(),

            city: Joi.string()
                .trim()
                .min(2)
                .max(100)
                .required(),

            state: Joi.string()
                .trim()
                .min(2)
                .max(100)
                .required(),

            pincode: Joi.string()
                .pattern(/^[1-9][0-9]{5}$/)
                .required()
                .messages({
                    "string.pattern.base":
                        "Invalid pincode"
                }),

            latitude: Joi.number()
                .min(-90)
                .max(90)
                .optional(),

            longitude: Joi.number()
                .min(-180)
                .max(180)
                .optional(),

            isDefault: Joi.boolean()
                .optional()

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

    static validateUpdateAddress(
        data: IUpdateAddress
    ): void {

        const schema = Joi.object({

            label: Joi.string()
                .trim()
                .min(2)
                .max(50),

            addressLine1: Joi.string()
                .trim()
                .min(5)
                .max(255),

            addressLine2: Joi.string()
                .trim()
                .max(255)
                .allow(""),

            city: Joi.string()
                .trim()
                .min(2)
                .max(100),

            state: Joi.string()
                .trim()
                .min(2)
                .max(100),

            pincode: Joi.string()
                .pattern(/^[1-9][0-9]{5}$/)
                .messages({
                    "string.pattern.base":
                        "Invalid pincode"
                }),

            latitude: Joi.number()
                .min(-90)
                .max(90),

            longitude: Joi.number()
                .min(-180)
                .max(180),

            isDefault: Joi.boolean()

        })
        .min(1);

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