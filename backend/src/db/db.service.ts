import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppStore, AppStoreDocument } from './schemas/app-store.schema';

@Injectable()
export class DbService implements OnModuleInit {
  // We use a fixed document ID to represent the entire JSON store
  private readonly STORE_ID = 'singleton-db-store';
  private cache: any = null;

  constructor(
    @InjectModel(AppStore.name) private appStoreModel: Model<AppStoreDocument>,
  ) {}

  async onModuleInit() {
    try {
      const existing = await this.appStoreModel.findOne({ storeId: this.STORE_ID });
      if (!existing) {
        console.log('MongoDB collection empty. Initializing empty Mongoose instance.');
        await this.appStoreModel.create({ storeId: this.STORE_ID });
      } else {
        console.log('MongoDB successfully connected & store verified.');
      }
    } catch (err) {
      console.error('Failed connecting to MongoDB or initializing store:', err.message);
    }
  }

  async readDB(): Promise<any> {
    try {
      if (this.cache) return this.cache;

      const doc = await this.appStoreModel.findOne({ storeId: this.STORE_ID }).lean().exec();
      if (doc) {
        // Strip out MongoDB specific fields to keep the rest of the app unaware
        const { _id, __v, storeId, ...data } = doc as any;
        this.cache = data;
        return data;
      }
      return {};
    } catch (error) {
      console.error('Error reading from MongoDB:', error);
      return {};
    }
  }

  async writeDB(data: any): Promise<boolean> {
    try {
      // Upsert the document
      await this.appStoreModel.updateOne(
        { storeId: this.STORE_ID },
        { $set: data },
        { upsert: true }
      );
      this.cache = data;
      return true;
    } catch (error) {
      console.error('Error writing to MongoDB:', error);
      return false;
    }
  }
}
