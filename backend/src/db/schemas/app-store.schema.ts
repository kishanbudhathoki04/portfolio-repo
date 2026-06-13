import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppStoreDocument = AppStore & Document;

@Schema({ strict: false, collection: 'qa_portfolio_data' })
export class AppStore {
  @Prop()
  storeId: string;
}

export const AppStoreSchema = SchemaFactory.createForClass(AppStore);
