import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClerkService } from '../../clerk/clerk.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private clerkService: ClerkService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private async validateRequest(request: any): Promise<boolean> {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const payload = await this.clerkService.verifyToken(token);
      request.user = {
        id: payload.sub,
        role: payload.role, 
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
