import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🔥 STRETCH GOAL 3: Enable cookie-parser middleware
  app.use(cookieParser());
  
  // Enable CORS for React frontend - đọc từ env cho production
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl,
    credentials: true, // ✅ Important: Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  
  const port = process.env.PORT || 3000;
  console.log(`Server running on http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
