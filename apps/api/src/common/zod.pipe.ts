import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/** Validates a body/query against a shared contract schema; 400 with field paths on failure. */
export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Invalid input',
        fields: [...new Set(result.error.issues.map((issue) => issue.path.join('.')))],
      });
    }
    return result.data;
  }
}
