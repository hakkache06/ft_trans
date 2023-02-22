import { Controller, Get, Param, ParseIntPipe, Query, Redirect, Req, Res } from '@nestjs/common';
import { Request, Response  } from 'express';
import { AuthService } from './auth.service';
import axios from 'axios';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('/redirect')
    @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8dac923a7faa5e271e7a48b1823cd099d6b981eb5193dca17613e24b4cd72ca5&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth&response_type=code', 301)
    redirect(){}

    
    @Get('')
    async storeUser (@Query() obj) {
       return this.authService.fetch_data(obj.code);
    }


}
