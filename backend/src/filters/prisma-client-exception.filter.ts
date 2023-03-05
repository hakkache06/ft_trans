//src/prisma-client-exception.filter.ts

import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientInitializationError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let message = 'Internel server error'
    let status = 500
    switch (exception.code) {
      case 'P1000':
        status = HttpStatus.FORBIDDEN;
        message = "Database credentials are invalid"
        break;
      case 'P1001':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = "Can't reach the database"
        break;
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = "Content already exists"
        break;
      case 'P2023':
          status = HttpStatus.BAD_REQUEST;
          message = 'Required field missing';
          break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Dependant record not found';
        break;
    }
    response.status(status).json({
      statusCode: status,
      message: message,
    });
       
  }
}