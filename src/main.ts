import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
  allowedHeaders: 'Content-Type, Accept, Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204
});
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Church Management API')
    .setDescription('API for managing church members, events, and more')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();