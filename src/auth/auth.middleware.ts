import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req, res, next) {
    const apiKey = req.headers['x-api-key']; // Custom API key header
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
      console.log(apiKey)
      // throw new UnauthorizedException('Invalid API Key');
    }

    next();
  }
}
