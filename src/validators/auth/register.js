const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../utils/ApiError');

const register = async (req, res, next) => {
    const createSchema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        displayName: Joi.string().required(),
    });
    try {
        await createSchema.validateAsync(req.body, {
            abortEarly: false,
        });
        next();
    } catch (error) {
        const errors = error?.details?.map((i) => ({
            fieldname: i?.path?.join(', '),
            message: i?.message?.replace(/\"/g, ''),
        }));
        next(
            new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                new Error(error).message.replace(/\"/g, '').replace('.', ','),
                errors,
            ),
        );
    }
};

module.exports = register;
