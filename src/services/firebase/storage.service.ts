import { storage } from '@/lib/firebase';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  UploadTaskSnapshot
} from 'firebase/storage';

class StorageService {
  /**
   * Upload a file to Firebase Storage
   * @param file File object from input
   * @param path Storage path (e.g., "avatars/userId.png")
   * @param onProgress Optional callback for upload progress
   * @returns Download URL of the uploaded file
   */
  async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Delete a file from Firebase Storage
   * @param path Storage path (e.g., "avatars/userId.png") or download URL
   */
  async deleteFile(pathOrUrl: string): Promise<void> {
    try {
      let fileRef;
      
      // Check if it's a full URL or just a path
      if (pathOrUrl.startsWith('http')) {
        fileRef = ref(storage, pathOrUrl);
      } else {
        fileRef = ref(storage, pathOrUrl);
      }
      
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
