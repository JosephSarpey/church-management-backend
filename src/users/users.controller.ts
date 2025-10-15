import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(ClerkAuthGuard)
  @Post('sync')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync user with backend' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async syncUser(@Request() req, @Body() body: any) {
    this.logger.log('Received user sync request');
    this.logger.debug(`Request body: ${JSON.stringify(body)}`);
    const { clerkId, email, firstName, lastName } = body;
    const user = await this.usersService.syncUser({
      id: clerkId,
      email_addresses: [{ email_address: email }],
      first_name: firstName,
      last_name: lastName,
    });
    return user;
  }
}
