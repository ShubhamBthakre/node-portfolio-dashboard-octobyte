import { httpStatusCodes } from "./httpStatusCodes.js";

export const formatResponse = (
  error,
  res,
  isError = true,
  data = {},
  successMessage = "Success",
  successCode = httpStatusCodes.OK,
) => {
  if (!isError) {
    return res.status(successCode).json({
      code: successCode,
      error: false,
      message: successMessage,
      exception: "",
      content: data,
    });
  }

  console.error("Error:", error);

  // Joi validation error
  if (error?.isJoi) {
    console.error("Validation Error Details:", error.details);
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      code: httpStatusCodes.BAD_REQUEST,
      error: true,
      message: error.details[0].message.replace(/\\"/g, ""),
      exception: "",
      content: {},
    });
  }

  // MongoDB duplicate key error
  if (error?.code === 11000) {
    const fieldName = Object.keys(error.keyValue || {})[0] ?? "field";
    const duplicateValue = error.keyValue?.[fieldName] ?? "";
    const message = `Duplicate value for ${fieldName}: '${duplicateValue}' is already registered.`;
    return res.status(httpStatusCodes.CONFLICT).json({
      code: httpStatusCodes.CONFLICT,
      error: true,
      message,
      exception: "",
      content: {},
    });
  }

  // Sequelize unique constraint error
  if (error?.name === "SequelizeUniqueConstraintError") {
    const field = error.errors?.[0]?.path ?? "field";
    const value = error.errors?.[0]?.value ?? "";
    const message = `${field} must be unique. '${value}' already exists.`;
    return res.status(httpStatusCodes.CONFLICT).json({
      code: httpStatusCodes.CONFLICT,
      error: true,
      message,
      exception: "",
      content: {},
    });
  }

  // CustomError / generic Error fallback
  let statusCode = httpStatusCodes.INTERNAL_SERVER;
  if (
    typeof error?.statusCode === "number" &&
    error.statusCode >= 100 &&
    error.statusCode < 600
  ) {
    statusCode = error.statusCode;
  } else if (
    typeof error?.code === "number" &&
    error.code >= 100 &&
    error.code < 600
  ) {
    statusCode = error.code;
  }

  return res.status(statusCode).json({
    code: statusCode,
    error: true,
    message: error?.message ?? "Internal server error",
    exception: "",
    content: error?.content ?? {},
  });
};
