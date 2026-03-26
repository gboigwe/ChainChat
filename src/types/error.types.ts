// Typed error classes for Stacks operations
export class StacksError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StacksError';
  }
}
