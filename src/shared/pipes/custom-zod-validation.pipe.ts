import { BadRequestException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

export const CustomZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    const errorTransformed = error.issues.map((issue) => {
      return {
        ...issue,
        path: issue.path.join('.') // custom from array to string (default return fucking array ???)
      }
    })
    return new BadRequestException(errorTransformed)
  }
})