import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MainRequest, Client } from 'src/common/extentions';
import { UserService } from 'src/receipt/user.service';
import { jwtConstants } from 'src/utils';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: MainRequest, payload: any) {
    try {
      const token = req.headers['x-api-key']
      let user = await this.usersService.findUserByToken(token as string);
      if (!user) {
        throw new UnauthorizedException();
      }

      return <Client>{
        _id: user._id,
        accessToken: user.accessToken,
        token: user.token,
        clientId: user.clientId,
        district: user.district,
        password: user.password,
        regNo: user.regNo,
        role: user.role,
        tin: user.tin,
        type: user.type,
        username: user.username,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
