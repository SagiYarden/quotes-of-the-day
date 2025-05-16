import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { QuotesService } from './quotes.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      ttl: 3600000, // Cache for 1 hour in milliseconds
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [AppController],
  providers: [QuotesService],
})
export class AppModule {}
