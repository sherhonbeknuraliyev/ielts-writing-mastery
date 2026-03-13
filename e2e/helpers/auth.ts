import { Page } from '@playwright/test';

// Matches the shape in src/client/utils/auth.tsx
const TEST_USER = {
  _id: 'test-user-id-123',
  telegramId: 12345678,
  firstName: 'Test',
  lastName: 'Student',
  username: 'teststudent',
  photoUrl: '',
};

// Auth keys from src/client/utils/auth.tsx:
//   localStorage.setItem("token", newToken)
//   localStorage.setItem("ielts-user", JSON.stringify(newUser))
const TOKEN_KEY = 'token';
const USER_KEY = 'ielts-user';
const TEST_TOKEN = 'test-jwt-token-for-e2e';

export async function loginAsTestUser(page: Page): Promise<void> {
  // Must navigate first so we're on the correct origin before writing localStorage
  await page.goto('/login');
  await page.evaluate(
    ({ token, user, tokenKey, userKey }) => {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(userKey, JSON.stringify(user));
    },
    { token: TEST_TOKEN, user: TEST_USER, tokenKey: TOKEN_KEY, userKey: USER_KEY },
  );
}

export async function clearAuth(page: Page): Promise<void> {
  // Navigate to the app origin first to avoid SecurityError on about:blank
  await page.goto('/login');
  await page.evaluate(
    ({ tokenKey, userKey }) => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    },
    { tokenKey: TOKEN_KEY, userKey: USER_KEY },
  );
}
