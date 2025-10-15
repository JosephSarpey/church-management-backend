import { 
  Controller, 
  Get, 
  Post, 
  Request, 
  UseGuards, 
  Body, 
  Headers, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebhookEvent } from '@clerk/clerk-sdk-node';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ClerkAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.id);
  }

  @Post('webhook/clerk')
  @ApiOperation({ summary: 'Handle Clerk webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  async handleWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Body() body: WebhookEvent
  ) {
    try {
      // Verify webhook signature
      const isValid = await this.authService.verifyWebhook(
        svixId,
        svixTimestamp,
        svixSignature,
        body
      );

      if (!isValid) {
        throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
      }

      // Handle different webhook events
      switch (body.type) {
        case 'user.created':
          await this.authService.handleUserCreated(body.data);
          break;
        case 'user.updated':
          await this.authService.handleUserUpdated(body.data);
          break;
        case 'user.deleted':
          await this.authService.handleUserDeleted(body.data.id);
          break;
        default:
          console.log(`Unhandled event type: ${body.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw new HttpException(
        'Error processing webhook',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
