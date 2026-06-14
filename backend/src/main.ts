import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use underlying Express instance to serve root and health checks
  // This COMPLETELY bypasses the 'api' global prefix and handles UptimeRobot's HEAD requests.
  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter.get('/', (req, res) => res.send('Server is running'));
  httpAdapter.head('/', (req, res) => res.status(200).end());
  httpAdapter.get('/health', (req, res) => res.json({ status: 'OK' }));
  httpAdapter.head('/health', (req, res) => res.status(200).end());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Enable CORS
  app.enableCors();
  
  // Set global prefix to map Next.js proxy rewrite
  app.setGlobalPrefix('api');
  
  await app.listen(3001);
  console.log('NestJS portfolio backend running on http://localhost:3001/api');
}
bootstrap();
