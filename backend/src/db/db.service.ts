import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppStore, AppStoreDocument } from './schemas/app-store.schema';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class DbService implements OnModuleInit {
  private readonly STORE_ID = 'singleton-db-store';
  // NOTE: No in-memory cache — removed because it caused stale data on the website.
  // MongoDB reads are fast enough on Atlas with the targeted lean() queries.

  constructor(
    @InjectModel(AppStore.name) private appStoreModel: Model<AppStoreDocument>,
  ) {}

  async onModuleInit() {
    // Configure Cloudinary ONCE at startup so every upload uses production credentials
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('[Cloudinary] Configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME);

    try {
      const existing = await this.appStoreModel.findOne({ storeId: this.STORE_ID });
      if (!existing) {
        console.log('MongoDB collection empty. Initializing empty store.');
        await this.appStoreModel.create({ storeId: this.STORE_ID });
      } else {
        console.log('MongoDB successfully connected & store verified.');
      }
    } catch (err) {
      console.error('Failed connecting to MongoDB or initializing store:', err.message);
    }
  }

  // ─────────── Cloudinary upload helper ───────────
  async uploadBufferToCloudinary(buffer: Buffer, folder = 'portfolio'): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (result) resolve(result.secure_url);
          else reject(error);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  // ─────────── Migrate legacy /api/images/:id blobs → Cloudinary ───────────
  // Call POST /api/admin/migrate-to-cloudinary to run this once.
  async migrateAllImagesToCloudinary(): Promise<{ migrated: number; errors: number }> {
    let migrated = 0;
    let errors = 0;

    const doc = await this.appStoreModel.findOne({ storeId: this.STORE_ID }).lean().exec() as any;
    if (!doc) return { migrated, errors };

    const { _id, __v, storeId, ...data } = doc;
    let modified = false;

    // Migrate project photos
    if (data.projects && Array.isArray(data.projects)) {
      for (const p of data.projects) {
        if (p.photo && p.photo.startsWith('/api/images/')) {
          const imgId = p.photo.replace('/api/images/', '');
          try {
            const imgDoc = await this.appStoreModel.findOne({ storeId: imgId, isImage: true }).lean().exec() as any;
            if (imgDoc && imgDoc.base64Data) {
              const buffer = Buffer.from(imgDoc.base64Data, 'base64');
              const cloudUrl = await this.uploadBufferToCloudinary(buffer);
              p.photo = cloudUrl;
              console.log(`[Migration] Project ${p.id} photo → ${cloudUrl}`);
              migrated++;
              modified = true;
            }
          } catch (err) {
            console.error(`[Migration] Failed to migrate project ${p.id}:`, err.message);
            errors++;
          }
        }
      }
    }

    // Migrate profile photo (stored at data.profile.photo)
    if (data.profile && data.profile.photo && data.profile.photo.startsWith('/api/images/')) {
      const imgId = data.profile.photo.replace('/api/images/', '');
      try {
        const imgDoc = await this.appStoreModel.findOne({ storeId: imgId, isImage: true }).lean().exec() as any;
        if (imgDoc && imgDoc.base64Data) {
          const buffer = Buffer.from(imgDoc.base64Data, 'base64');
          const cloudUrl = await this.uploadBufferToCloudinary(buffer);
          data.profile.photo = cloudUrl;
          console.log(`[Migration] Profile photo → ${cloudUrl}`);
          migrated++;
          modified = true;
        }
      } catch (err) {
        console.error('[Migration] Failed to migrate profile photo:', err.message);
        errors++;
      }
    }

    if (modified) {
      await this.appStoreModel.updateOne(
        { storeId: this.STORE_ID },
        { $set: data }
      );
      console.log(`[Migration] Complete. Migrated ${migrated}, errors: ${errors}`);
    }

    return { migrated, errors };
  }

  // ─────────── Legacy image blob retrieval (kept for existing /api/images/:id URLs) ───────────
  async getImage(id: string): Promise<any> {
    return this.appStoreModel.findOne({ storeId: id, isImage: true }).lean().exec();
  }

  // ─────────── Core read/write ───────────
  // In-memory cache: MongoDB is only queried once after cold start.
  // Every write (writeSection / writeDB) clears the cache immediately,
  // so the next read always gets fresh data from MongoDB.
  private cache: any = null;

  async readDB(): Promise<any> {
    try {
      if (this.cache) return this.cache;

      const doc = await this.appStoreModel.findOne({ storeId: this.STORE_ID }).lean().exec();
      if (doc) {
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

  // Writes ONLY the changed section (e.g. 'profile', 'projects') for speed.
  // Clears cache so next readDB fetches fresh data.
  async writeSection(section: string, value: any): Promise<boolean> {
    try {
      await this.appStoreModel.updateOne(
        { storeId: this.STORE_ID },
        { $set: { [section]: value } },
        { upsert: true }
      );
      this.cache = null; // invalidate — next read pulls fresh from MongoDB
      return true;
    } catch (error) {
      console.error(`Error writing section '${section}' to MongoDB:`, error);
      return false;
    }
  }

  // Legacy full-document write — kept for backward compatibility
  async writeDB(data: any): Promise<boolean> {
    try {
      await this.appStoreModel.updateOne(
        { storeId: this.STORE_ID },
        { $set: data },
        { upsert: true }
      );
      this.cache = null; // invalidate
      return true;
    } catch (error) {
      console.error('Error writing to MongoDB:', error);
      return false;
    }
  }
}


