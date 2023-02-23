import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guards';

@Controller('test')
export class TestController {
    @UseGuards(JwtGuard)
    @Get()
    getProfile(@Req() req: Request) {
        return req.user
    }    
}
