'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import crypto from 'crypto';

// Basic hashing for password storage
const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export async function adminLogin(username: string, password: string) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  // Try checking Firestore first if configured and accessible
  try {
    const adminRef = doc(db, 'admin', 'credentials');
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
      const data = adminSnap.data();
      const storedUsername = data.username?.trim();
      const storedPassword = data.password?.trim();
      const storedHash = data.passwordHash?.trim();

      const usernameMatch = storedUsername?.toLowerCase() === trimmedUsername.toLowerCase();
      const passwordMatch = 
        (storedPassword && storedPassword === trimmedPassword) ||
        (storedHash && storedHash === hashPassword(trimmedPassword)) ||
        (storedHash && storedHash === trimmedPassword);

      if (usernameMatch && passwordMatch) {
        return { success: true };
      }
      return { success: false, error: 'Invalid username or password.' };
    }
  } catch (error: any) {
    // If Firestore security rules block unauthenticated reads or database is offline,
    // catch the permission-denied error gracefully so login remains fully functional.
    console.warn('Firestore admin verification fallback:', error?.message);
  }

  // Designated admin credentials fallback
  const defaultAdminUser = 'OxygenMultifit';
  const defaultAdminPass = 'OxygenMultifit88@#';

  if (
    trimmedUsername.toLowerCase() === defaultAdminUser.toLowerCase() &&
    trimmedPassword === defaultAdminPass
  ) {
    return { success: true };
  }

  return { success: false, error: 'Invalid username or password.' };
}
