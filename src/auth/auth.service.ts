import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async fetch_data(code: string) {
    const client_id =
      'u-s4t2ud-8dac923a7faa5e271e7a48b1823cd099d6b981eb5193dca17613e24b4cd72ca5';
    const client_secret =
      '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';
    const redirect_uri = 'http://localhost:3000/auth';
    const token = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'authorization_code',
      client_id,
      client_secret,
      code,
      redirect_uri,
    });
    const data = (
      await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${token.data.access_token}`,
        },
      })
    ).data;

    // const user_id : string = data.id;
    // const user_name : string = data.displayname;
    // const user_avatar : string = data.image.versions.medium;
    const upsertUser = await this.prisma.User.upsert({
      where: {
        intra_id: data.id,
      },
      update: {},
      create: {
        name: data.displayname,
        intra_id: data.id,
        avatar: data.image.versions.medium,
      },
    });
    const jwt = {
      id: upsertUser.id,
      tfa_required: !!upsertUser.tfa,
    };
    return data;
  }
}
