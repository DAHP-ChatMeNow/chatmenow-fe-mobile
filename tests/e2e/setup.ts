import { type Page } from '@playwright/test';

export type MockState = {
  contacts: Array<{ _id: string; id: string; displayName: string; isOnline: boolean }>;
  friendRequests: Array<{
    _id: string;
    id: string;
    senderId: { _id: string; id: string; displayName: string };
  }>;
  notifications: Array<{
    _id: string;
    id: string;
    type: string;
    message: string;
    displayText: string;
    isRead: boolean;
    senderName: string;
    senderId: { _id: string; id: string; displayName: string };
    referenced?: { _id: string; id: string };
    createdAt: string;
  }>;
};

const createAuthStorageState = (role: 'user' | 'admin' = 'user') => ({
  user: {
    _id: role === 'admin' ? 'a-1' : 'u-1',
    id: role === 'admin' ? 'a-1' : 'u-1',
    displayName: role === 'admin' ? 'E2E Admin' : 'E2E User',
    role,
  },
  token: 'e2e-token',
  role,
  rememberToken: null,
  rememberedAccounts: [],
});

export const initialState = (): MockState => ({
  contacts: [
    { _id: 'u-2', id: 'u-2', displayName: 'Nguyen Minh', isOnline: true },
    { _id: 'u-3', id: 'u-3', displayName: 'Tran Lan', isOnline: false },
  ],
  friendRequests: [
    { _id: 'fr-1', id: 'fr-1', senderId: { _id: 'u-4', id: 'u-4', displayName: 'Le Hoang' } },
  ],
  notifications: [
    {
      _id: 'n-1',
      id: 'n-1',
      type: 'friend_request',
      message: 'da gui loi moi ket ban',
      displayText: 'đã gửi lời mời kết bạn',
      isRead: false,
      senderName: 'Le Hoang',
      senderId: { _id: 'u-4', id: 'u-4', displayName: 'Le Hoang' },
      referenced: { _id: 'fr-1', id: 'fr-1' },
      createdAt: new Date().toISOString(),
    },
  ],
});

export async function setupAuth(page: Page, role: 'user' | 'admin' = 'user') {
  const authStorageState = createAuthStorageState(role);
  const baseURL =
    process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || 3000}`;
  // use configured baseURL for cookie URLs; tests use relative routes so navigation still works
  await page.context().addCookies([
    { name: 'auth-token', value: 'e2e-token', url: baseURL },
    { name: 'user-role', value: role, url: baseURL },
  ]);

  await page.addInitScript((state) => {
    localStorage.setItem('auth-storage', JSON.stringify({ state, version: 0 }));
  }, authStorageState);
}

export async function setupMockApi(page: Page): Promise<MockState> {
  const state = initialState();

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          _id: 'u-1',
          id: 'u-1',
          displayName: 'E2E User',
          email: 'e2e.user@example.com',
          role: 'user',
        },
      }),
    });
  });

  await page.route('**/users/u-1/contacts', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, friends: state.contacts }) });
  });

  await page.route('**/users/friend-requests/pending', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, requests: state.friendRequests }) });
  });

  await page.route(/.*\/users\/[^^]+\/email$/, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, email: 'friend@example.com', displayName: 'Le Hoang' }) });
  });

  await page.route('**/users/blocked', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, blockedUsers: [], total: 0 }) });
  });

  await page.route(/.*\/users\/friend-requests\/([^/]+)\/accept$/, async (route) => {
    const parts = route.request().url().split('/');
    const requestId = parts.at(-2) || '';
    const accepted = state.friendRequests.find((request) => request.id === requestId);

    if (accepted) {
      state.friendRequests = state.friendRequests.filter((request) => request.id !== requestId);
      state.contacts = [
        { _id: accepted.senderId._id, id: accepted.senderId.id, displayName: accepted.senderId.displayName, isOnline: false },
        ...state.contacts,
      ];
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  await page.route(/.*\/users\/friend-requests\/([^/]+)\/reject$/, async (route) => {
    const parts = route.request().url().split('/');
    const requestId = parts.at(-2) || '';
    state.friendRequests = state.friendRequests.filter((request) => request.id !== requestId);

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  await page.route(/.*\/users\/friends\/([^/]+)$/, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fallback();
      return;
    }

    const parts = route.request().url().split('/');
    const friendId = parts.at(-1) || '';
    state.contacts = state.contacts.filter((friend) => friend.id !== friendId);

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  await page.route('**/api/notifications', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: state.notifications, unreadCount: state.notifications.filter((n) => !n.isRead).length }) });
  });

  await page.route(/.*\/api\/notifications\/([^/]+)\/read$/, async (route) => {
    const parts = route.request().url().split('/');
    const id = parts.at(-2) || '';
    state.notifications = state.notifications.map((noti) => (noti.id === id ? { ...noti, isRead: true } : noti));

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  await page.route('**/api/notifications/read-all', async (route) => {
    state.notifications = state.notifications.map((noti) => ({ ...noti, isRead: true }));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  return state;
}
