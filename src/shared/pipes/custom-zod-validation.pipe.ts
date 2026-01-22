import { BadRequestException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

export const CustomZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    // TODO: Kiem tra neu body empty thi loi no return lai "undefined" => [{"code":"invalid_type","expected":"string","received":"undefined","path":[],"message":"Required"}]
    const errorTransformed = error.issues.map((issue) => {
      return {
        ...issue,
        path: issue.path.join('.') // custom from array to string (default return fucking array ???)
      }
    })
    return new BadRequestException(errorTransformed)
  }
})