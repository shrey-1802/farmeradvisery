import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageProvider, IUploadFile } from './storage-provider.interface';

export type UploadCategory =
  | 'crop-images'
  | 'farmer-documents'
  | 'reports'
  | 'certificates';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadsRoot: string;

  /**
   * Sub-directory structure created under uploads/:
   *   uploads/
   *   ├── farmer-documents/   — KYC, land records, consent forms
   *   ├── crop-images/        — pest/disease photo uploads for AI diagnosis
   *   ├── reports/            — generated multilingual PDF advisory reports
   *   └── certificates/       — government scheme or subsidy certificates
   */
  private readonly categories: UploadCategory[] = [
    'crop-images',
    'farmer-documents',
    'reports',
    'certificates',
  ];

  constructor() {
    this.uploadsRoot = path.join(process.cwd(), 'uploads');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    for (const category of this.categories) {
      const dir = path.join(this.uploadsRoot, category);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Created upload directory: uploads/${category}/`);
      }
    }
  }

  /**
   * Upload a file to the appropriate subdirectory.
   * Defaults to 'crop-images' if no category is provided.
   */
  async uploadFile(
    file: IUploadFile,
    category: UploadCategory = 'crop-images',
  ): Promise<{ fileUrl: string; filePath: string }> {
    if (!file || !file.mimetype || !file.buffer) {
      throw new BadRequestException('Invalid or missing file upload payload');
    }

    const allowedMimeTypes: Record<UploadCategory, string[]> = {
      'crop-images': ['image/jpeg', 'image/png', 'image/webp'],
      'farmer-documents': ['image/jpeg', 'image/png', 'application/pdf'],
      'reports': ['application/pdf', 'text/html'],
      'certificates': ['image/jpeg', 'image/png', 'application/pdf'],
    };

    const allowed = allowedMimeTypes[category];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type for category [${category}]. Allowed types: ${allowed.join(', ')}`,
      );
    }

    const maxSizes: Record<UploadCategory, number> = {
      'crop-images':       10 * 1024 * 1024, // 10MB
      'farmer-documents':  5  * 1024 * 1024, //  5MB
      'reports':           20 * 1024 * 1024, // 20MB
      'certificates':      5  * 1024 * 1024, //  5MB
    };

    if (file.size > maxSizes[category]) {
      const limitMb = maxSizes[category] / (1024 * 1024);
      throw new BadRequestException(
        `File exceeds size limit of ${limitMb}MB for category [${category}]`,
      );
    }

    const fileExt = path.extname(file.originalname || '') || '.jpg';
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 100000);
    const filename = `${category}_${timestamp}_${rand}${fileExt}`;
    const targetPath = path.join(this.uploadsRoot, category, filename);

    await fs.promises.writeFile(targetPath, file.buffer);
    this.logger.log(`File stored → uploads/${category}/${filename}`);

    return {
      fileUrl: `/uploads/${category}/${filename}`,
      filePath: targetPath,
    };
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Deleted file: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * List all files in a specific upload category directory.
   */
  async listFiles(category: UploadCategory): Promise<string[]> {
    const dir = path.join(this.uploadsRoot, category);
    try {
      const files = await fs.promises.readdir(dir);
      return files.filter((f) => !f.startsWith('.'));
    } catch {
      return [];
    }
  }
}
