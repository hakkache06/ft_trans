import { Injectable, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UserDto } from './dto';

@Injectable()
export class AuthService {
    constructor (private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

    async fetch_data(code : string) {
        const client_id = "u-s4t2ud-8dac923a7faa5e271e7a48b1823cd099d6b981eb5193dca17613e24b4cd72ca5";
        const client_secret = "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";
        const redirect_uri = "http://localhost:3000/auth";
        const token = await axios.post('https://api.intra.42.fr/oauth/token', {
            "grant_type":"authorization_code",
            client_id,
            client_secret,
            code,
            redirect_uri
        })

        const data = (await axios.get('https://api.intra.42.fr/v2/me', {
            headers: {
                'Authorization': `Bearer ${token.data.access_token}`
            }
        })).data
        return {
          id: data.id,
          name: data.displayname,
          avatar: data.image.versions.medium
        };
    }
      
    @UsePipes(new ValidationPipe())
    async create_user(userDto : UserDto) {
      const upsertUser = await this.prisma.user.upsert({
          where: {
            intra_id: userDto.id
          },
          update: {},
          create: {
            intra_id: userDto.id,
            name: userDto.name,
            avatar: userDto.avatar,
          },
        })
        return upsertUser;
    }

    async signToken(idUser: string, tfa_required = false) : Promise<{access_token: string}> {
        const payload = {
          id: idUser,
          tfa_required,
        };

        const secret = await this.config.get('JWT_SECRET')
        const token = await this.jwt.signAsync(payload, {
          expiresIn: '15m',
          secret,
        })
        return {
            access_token: token,
        };
    }

    async generate_2f_auth(user: any)
    {
      const secret = authenticator.generateSecret();
      const otpauthUrl = authenticator.keyuri(user.name, 'Transcendence 2F Auth', secret);

      return {
        secret,
        otpauthUrl
      }
    }

    async generateQrCodeDataURL(otpAuthUrl: string) {
      return toDataURL(otpAuthUrl);
    }

    
    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, secret: any) {
      return authenticator.verify({
        token: twoFactorAuthenticationCode,
        secret,
      });
    }

    async authenticate2f(user: any, body : any)
    {
    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      user.secret,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
      return this.signToken(user.id, true)
    }

    async turnOnTwoFactorAuthentication(user: any, secret: string) {
      const userUpdated = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tfa: secret,
        }
      })
    }

    async turnOffTwoFactorAuthentication(user: any) {
      const userUpdated = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tfa: null,
        }
      })
    }

  }