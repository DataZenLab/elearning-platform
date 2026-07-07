import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firestoreService } from '@/services/firebase/firestore.service';
import type { LoginCredentials, RegisterCredentials } from '@/types';

class AuthService {
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Firebase Reset Password Error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }
  async loginWithEmail(credentials: LoginCredentials): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password!
      );
      
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Vui lòng kiểm tra hộp thư email (và mục Spam) để xác minh tài khoản trước khi đăng nhập.');
      }
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Firebase Email Login Error:', error);
      if (error.message.includes('xác minh tài khoản')) {
        throw error;
      }
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async registerWithEmail(credentials: RegisterCredentials): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password!
      );
      
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName
      });
      
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Firebase Email Registration Error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async loginWithGoogle(): Promise<FirebaseUser> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (error: any) {
      console.error('Firebase Google Auth Error:', error);
      throw new Error('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
    }
  }

  /**
   * Admin-only: Create a new instructor account.
   * Creates a Firebase Auth user + sets their role to 'instructor' in Firestore.
   * NOTE: This uses createUserWithEmailAndPassword which SWITCHES the current session.
   * To avoid that, a real production app would use Firebase Admin SDK (server-side).
   * Here we store the admin's credential and re-sign-in after creation.
   */
  async createInstructorAccount(
    email: string,
    password: string,
    fullName: string,
    adminEmail: string,
    adminPassword: string
  ): Promise<void> {
    let newUid: string | null = null;
    try {
      // Step 1: Create the new instructor Firebase Auth account
      const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
      newUid = newUserCredential.user.uid;

      await updateProfile(newUserCredential.user, { displayName: fullName });

      // Step 2: Write instructor profile to Firestore
      await firestoreService.setDocument('users', newUid, {
        uid: newUid,
        email,
        name: fullName,
        role: 'instructor',
        status: 'active',
      });

      // Step 3: Re-sign-in as admin so admin session is restored
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (error: any) {
      console.error('Create instructor error:', error);
      // If creation succeeded but something else failed, try to restore admin session
      if (newUid) {
        try { await signInWithEmailAndPassword(auth, adminEmail, adminPassword); } catch {}
      }
      throw new Error(this.getAuthErrorMessage(error.code) || 'Tạo tài khoản giảng viên thất bại.');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase Logout Error:', error);
      throw new Error('Đăng xuất thất bại.');
    }
  }

  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email hoặc mật khẩu không chính xác.';
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng. Vui lòng dùng email khác.';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu từ 6 ký tự trở lên.';
      case 'auth/invalid-email':
        return 'Địa chỉ email không hợp lệ.';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền.';
      default:
        return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    }
  }
}

export const authService = new AuthService();
