import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DbService } from './db.service';
import { AppStore, AppStoreSchema } from './schemas/app-store.schema';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: AppStore.name, schema: AppStoreSchema }])],
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
