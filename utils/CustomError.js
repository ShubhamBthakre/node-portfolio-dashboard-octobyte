export class CustomError extends Error {
  constructor(message, code, content) {
    super(message || "An error occurred");
    this.name = "CustomError";
    this.statusCode = code;
    this.code = code;
    this.content = content;
  }
}
