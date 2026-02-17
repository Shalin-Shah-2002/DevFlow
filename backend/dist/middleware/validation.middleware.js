"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validation middleware to check express-validator results
 * Use this after validation rules in routes
 */
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((error) => ({
                field: error.type === 'field' ? error.path : undefined,
                message: error.msg,
            })),
        });
    }
    next();
};
exports.validate = validate;
