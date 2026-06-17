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
        // Run migration for Base64 Images
        await this.migrateBase64Images(existing);
      }
    } catch (err) {
      console.error('Failed connecting to MongoDB or initializing store:', err.message);
    }
  }

  private async migrateBase64Images(doc: any) {
    let modified = false;
    const data = doc.toObject ? doc.toObject() : doc;
    
    // Migrate Projects
    if (data.projects && Array.isArray(data.projects)) {
      for (let p of data.projects) {
        if (p.photo && p.photo.startsWith('data:image')) {
          console.log(`Migrating project photo for ${p.id}...`);
          const url = await this.saveImageFromBase64(p.photo);
          p.photo = `/api/images/${url}`;
          modified = true;
        }
      }
    }

    // Migrate Profile Photo
    if (data.photo && data.photo.startsWith('data:image')) {
      console.log(`Migrating profile photo...`);
      const url = await this.saveImageFromBase64(data.photo);
      data.photo = `/api/images/${url}`;
      modified = true;
    }

    if (modified) {
      console.log('Migration complete. Updating core document...');
      await this.appStoreModel.updateOne({ storeId: this.STORE_ID }, { $set: data });
    }
  }

  async saveImageFromBase64(dataUrl: string): Promise<string> {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    return this.saveImage(matches[2], matches[1]);
  }

  async saveImage(base64Data: string, mimeType: string): Promise<string> {
    const id = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await this.appStoreModel.create({
      storeId: id,
      base64Data,
      mimeType,
      isImage: true
    });
    return id;
  }

  async getImage(id: string): Promise<any> {
    return this.appStoreModel.findOne({ storeId: id, isImage: true }).lean().exec();
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
