import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { PrismaService } from "../../prisma/prisma.service";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
        where : {
            id: payload.id,
        }
    })
    console.log(user.tfa_authenticated, user.tfa_enabled)
    if (!user.tfa_enabled) {
      return user;
    }
    if (user.tfa_authenticated) {
      return user;
    }
  }
}
