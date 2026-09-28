export class GenerationError extends Error {
  constructor(message, cause = null) {
    super(message);
    this.name = 'GenerationError';
    this.cause = cause;
  }
}
export class ValidationError extends GenerationError {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
export class LayoutError extends GenerationError {
  constructor(message) {
    super(message);
    this.name = 'LayoutError';
  }
}
export class ImageError extends GenerationError {
  constructor(message) {
    super(message);
    this.name = 'ImageError';
  }
}
