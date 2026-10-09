import Joi from "joi";

export const createCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .max(50)
    .required()
    .messages({
      "string.empty": "Coupon code is required",
      "string.max": "Coupon code cannot exceed 50 characters",
      "any.required": "Coupon code is required",
    }),

  type: Joi.string()
    .valid("PERCENTAGE", "FLAT", "FREE_DELIVERY", "BOGO")
    .required()
    .messages({
      "any.only": "Coupon type must be PERCENTAGE, FLAT, FREE_DELIVERY or BOGO",
      "any.required": "Coupon type is required",
    }),

  discountValue: Joi.number()
    .positive()
    .messages({
      "number.base": "Discount value must be a number",
      "number.positive": "Discount value must be greater than 0",
    }),

  minOrderAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.min": "Minimum order amount cannot be negative",
    }),

  maxDiscount: Joi.when("type", {
    is: "PERCENTAGE",
    then: Joi.number()
      .min(0)
      .required()
      .messages({
        "any.required":
          "Max discount is required for percentage coupons",
        "number.min": "Max discount cannot be negative",
      }),
    otherwise: Joi.number()
      .min(0)
      .optional()
      .messages({
        "number.min": "Max discount cannot be negative",
      }),
  }),

  startDate: Joi.date()
    .optional()
    .messages({
      "date.base": "Start date must be a valid date",
    }),

  endDate: Joi.date()
    .greater(Joi.ref("startDate"))
    .optional()
    .messages({
      "date.base": "End date must be a valid date",
      "date.greater": "End date must be after start date",
    }),

  usageLimit: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.integer": "Usage limit must be an integer",
      "number.min": "Usage limit must be at least 1",
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "isActive must be a boolean value",
    }),
});

//update coupon
export const updateCouponSchema = Joi.object({
    code: Joi.string()
        .trim()
        .uppercase()
        .max(50)
        .messages({
            "string.max": "Coupon code cannot exceed 50 characters",
        }),

    type: Joi.string()
        .valid("PERCENTAGE","FLAT", "FREE_DELICERY", "BOGO")
        .messages({
            "any.only":
                "Coupon type must be PERCENTAGE or FIXED",
        }),

    discountValue: Joi.number()
        .positive()
        .messages({
            "number.positive":
                "Discount value must be greater than 0",
        }),

    minOrderAmount: Joi.number()
        .min(0)
        .messages({
            "number.min":
                "Minimum order amount cannot be negative",
        }),

    maxDiscount: Joi.number()
        .min(0)
        .messages({
            "number.min":
                "Maximum discount cannot be negative",
        }),

    startDate: Joi.date()
        .messages({
            "date.base":
                "Start date must be a valid date",
        }),

    endDate: Joi.date()
        .messages({
            "date.base":
                "End date must be a valid date",
        }),

    usageLimit: Joi.number()
        .integer()
        .min(1)
        .messages({
            "number.integer":
                "Usage limit must be an integer",
            "number.min":
                "Usage limit must be at least 1",
        }),

    isActive: Joi.boolean()
        .messages({
            "boolean.base":
                "isActive must be a boolean",
        }),
}).min(1);

//activate deactivate coupon
export const updateCouponStatusSchema = Joi.object({
    isActive: Joi.boolean()
        .required()
        .messages({
            "boolean.base":
                "isActive must be a boolean value",
            "any.required":
                "isActive is required",
        }),
});


export const validateCouponSchema = Joi.object({
  couponCode: Joi.string().required().messages({
    "string.empty": "Coupon code is required",
    "any.required": "Coupon code is required",
  }),

  orderAmount: Joi.number().positive().required().messages({
    "number.positive": "Order amount must be greater than 0",
    "any.required": "Order amount is required",
  }),
});