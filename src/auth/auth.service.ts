import { Injectable, UsePipes, ValidationPipe } from '@nestjs/common';
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

    async signToken(idUser: string) : Promise<{access_token: string}> {
        const payload = {
          id: idUser,
        }

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

      const updateUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tfa: secret
        },
      })
      return {
        secret,
        otpauthUrl
      }
    }

    async generateQrCodeDataURL(otpAuthUrl: string) {
      return toDataURL(otpAuthUrl);
    }

    
    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: any) {
      return authenticator.verify({
        token: twoFactorAuthenticationCode,
        secret: user.tfa,
      });
    }

    async authenticate2f(user: any)
    {
      const updateUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tfa_authenticated: true,
        },
      })

      const payload = {
        id: user.id,
        tfa_enabled: user.tfa_enabled,
        tfa_authenticated: user.tfa_authenticated
      }

      const secret = await this.config.get('JWT_SECRET')
      const token = await this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret,
      })
      return {
          access_token: token,
      };
    }

    async turnOnTwoFactorAuthentication(user: any) {
      const userUpdated = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tfa_enabled: true,
        }
      })
    }

    async turnOffTwoFactorAuthentication(user: any) {
      const userUpdated = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tfa_enabled: false,
          tfa: null,
        }
      })
    }

  }