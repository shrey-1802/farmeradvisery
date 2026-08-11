export interface IUploadFile {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface IStorageProvider {
  uploadFile(file: IUploadFile): Promise<{ fileUrl: string; filePath: string }>;
  deleteFile(filePath: string): Promise<boolean>;
}
