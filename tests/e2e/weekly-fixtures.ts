import { type Page } from '@playwright/test';
import { initialState, setupAuth, setupMockApi } from './setup';

const userFixture = {
  _id: 'u-1',
  id: 'u-1',
  displayName: 'E2E User',
  email: 'e2e.user@example.com',
  role: 'user',
  avatar: '',
  bio: 'Demo bio',
  isOnline: true,
  hometown: '',
  phoneNumber: '',
  gender: '',
  school: '',
  maritalStatus: '',
};

const adminFixture = {
  _id: 'a-1',
  id: 'a-1',
  displayName: 'E2E Admin',
  email: 'e2e.admin@example.com',
  role: 'admin',
  avatar: '',
  bio: 'Admin bio',
  isOnline: true,
};

const parseJsonBody = (route: { request(): { postData(): string | null } }) => {
  const raw = route.request().postData();
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export async function setupTurnstileMock(page: Page, token = 'turnstile-test-token') {
  await page.addInitScript((turnstileToken) => {
    window.turnstile = {
      render: (_element: HTMLElement, options: { callback: (value: string) => void }) => {
        setTimeout(() => options.callback(turnstileToken), 0);
        return 'turnstile-widget';
      },
      reset: () => {},
      remove: () => {},
    };
  }, token);
}

export async function setupSignupMocks(page: Page) {
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: userFixture }),
    });
  });

  await page.route('**/auth/send-otp', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OTP sent', expiresIn: 600 }),
    });
  });

  await page.route('**/auth/verify-otp', async (route) => {
    const body = parseJsonBody(route);
    const otp = String(body.otp || '');

    if (otp === '000000') {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'OTP không hợp lệ' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OTP verified', verified: true }),
    });
  });

  await page.route('**/auth/register', async (route) => {
    const body = parseJsonBody(route);
    const displayName = String(body.displayName || 'E2E User');
    const email = String(body.email || 'e2e.user@example.com');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { ...userFixture, displayName, email },
        token: 'registered-token',
        role: 'user',
        message: 'Đăng ký thành công',
      }),
    });
  });
}

export async function setupLoginMocks(page: Page) {
  await setupTurnstileMock(page);

  await page.route('**/auth/login', async (route) => {
    const body = parseJsonBody(route);
    const password = String(body.password || '');

    if (password === 'wrongpass') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Sai mật khẩu' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: userFixture,
        token: 'login-token',
        role: 'user',
        message: 'Đăng nhập thành công',
      }),
    });
  });

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: userFixture }),
    });
  });

  await page.route('**/auth/account-unlock/send-otp', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OTP sent' }),
    });
  });

  await page.route('**/auth/account-unlock/confirm', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Đã mở khóa tài khoản' }),
    });
  });
}

export async function setupProfileMocks(page: Page) {
  const state = {
    user: { ...userFixture },
  };

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: state.user }),
    });
  });

  await page.route('**/users/profile', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: state.user }),
      });
      return;
    }

    const body = parseJsonBody(route);
    state.user = {
      ...state.user,
      displayName: String(body.displayName || state.user.displayName),
      bio: String(body.bio || state.user.bio || ''),
      hometown: String(body.hometown || state.user.hometown || ''),
      phoneNumber: String(body.phoneNumber || state.user.phoneNumber || ''),
      gender: String(body.gender || state.user.gender || ''),
      school: String(body.school || state.user.school || ''),
      maritalStatus: String(body.maritalStatus || state.user.maritalStatus || ''),
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: state.user, message: 'Đã cập nhật hồ sơ' }),
    });
  });

  await page.route('**/upload/avatar', async (route) => {
    if (route.request().method() === 'POST') {
      state.user = { ...state.user, avatar: 'avatars/e2e-avatar.jpg' };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Đã tải ảnh', user: state.user, avatar: state.user.avatar }),
      });
      return;
    }

    state.user = { ...state.user, avatar: '' };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ msg: 'Đã xóa ảnh đại diện', user: state.user }),
    });
  });

  await page.route('**/posts/user/u-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, posts: [], total: 0, page: 1, limit: 10 }),
    });
  });
}

export async function setupContentMocks(page: Page) {
  const state = initialState();
  const posts = [
    {
      _id: 'p-1',
      id: 'p-1',
      authorId: { _id: 'u-1', id: 'u-1', displayName: 'E2E User', avatar: '' },
      content: 'Week 2 sample post',
      privacy: 'public',
      media: [],
      likesCount: 0,
      commentsCount: 0,
      trendingScore: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date().toISOString(),
    },
  ];

  await page.route('**/posts/feed', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, posts, total: posts.length, page: 1, limit: 10 }),
    });
  });

  await page.route('**/posts', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: `p-${Date.now()}`,
        id: `p-${Date.now()}`,
        authorId: { _id: 'u-1', id: 'u-1', displayName: 'E2E User', avatar: '' },
        content: 'Week 2 social post',
        privacy: 'public',
        media: [],
        likesCount: 0,
        commentsCount: 0,
        trendingScore: 0,
        createdAt: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/posts/p-1/like', async (route) => {
    const method = route.request().method();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        liked: method === 'PUT',
        aiSuggestion: { text: 'Goi y binh luan', options: [] },
      }),
    });
  });

  await page.route('**/posts/p-1/comments', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, comments: [] }),
      });
      return;
    }

    const body = parseJsonBody(route);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        postId: 'p-1',
        comments: [
          {
            _id: 'c-1',
            id: 'c-1',
            postId: 'p-1',
            userId: { _id: 'u-1', id: 'u-1', displayName: 'E2E User' },
            content: String(body.content || 'Binh luan mau'),
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    });
  });

  await page.route('**/stories/feed', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        stories: [
          {
            user: { _id: 'u-2', id: 'u-2', displayName: 'Story User', avatar: '' },
            latestStoryAt: new Date().toISOString(),
            hasUnviewed: true,
            stories: [
              {
                _id: 's-1',
                authorId: { _id: 'u-2', id: 'u-2', displayName: 'Story User', avatar: '' },
                caption: 'Story week 2',
                privacy: 'friends',
                media: { url: 'https://example.com/story.jpg', type: 'image' },
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route('**/stories/s-1/view', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route('**/stories/s-1/react', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route('**/stories/s-1/reply', async (route) => {
    const body = parseJsonBody(route);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: 'sr-1',
        id: 'sr-1',
        storyId: 's-1',
        userId: { _id: 'u-1', id: 'u-1', displayName: 'E2E User' },
        message: String(body.message || 'Reply'),
        createdAt: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/reels/feed', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        reels: [],
        hasMore: false,
        nextCursor: null,
      }),
    });
  });

  await page.route('**/reels/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        reels: [],
        hasMore: false,
        nextCursor: null,
      }),
    });
  });

  await setupAuth(page);
  await setupMockApi(page);
  return state;
}

export async function setupAdminMocks(page: Page) {
  await setupAuth(page, 'admin');

  await page.route('**/admin/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stats: {
          totalUsers: 128,
          activeUsers: 104,
          totalPosts: 64,
          pendingPosts: 3,
          newUsersToday: 7,
          newPostsToday: 12,
        },
      }),
    });
  });

  await page.route(/.*\/users\/all(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        users: [
          {
            _id: 'u-2',
            id: 'u-2',
            displayName: 'Nguyen Minh',
            email: 'minh@example.com',
            role: 'user',
            isActive: true,
            accountStatus: 'active',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'u-3',
            id: 'u-3',
            displayName: 'Tran Lan',
            email: 'lan@example.com',
            role: 'user',
            isActive: true,
            accountStatus: 'active',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 2,
        offset: 0,
        limit: 7,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }),
    });
  });

  await page.route('**/users/u-2/contacts', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        friends: [],
        total: 0,
      }),
    });
  });

  await page.route('**/posts/admin/all', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        posts: [
          {
            _id: 'ap-1',
            id: 'ap-1',
            content: 'Admin post',
            author: {
              _id: 'u-2',
              displayName: 'Nguyen Minh',
              email: 'minh@example.com',
              avatar: '',
            },
            likesCount: 4,
            commentsCount: 2,
            privacy: 'public',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      }),
    });
  });

  await page.route('**/posts/admin/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        rangeDays: 30,
        totalPosts: 64,
        postsInRange: 18,
        totalLikes: 142,
        totalComments: 40,
        avgLikesPerPost: 2.2,
        avgCommentsPerPost: 0.6,
        privacyStats: { public: 32, friends: 20, custom: 8, private: 4 },
        postsPerDay: [],
        topPosts: [],
      }),
    });
  });

  const aiConfig = {
    isEnabled: true,
    autoCommentEnabled: true,
    botName: 'ChatMeNow Assistant',
    botAvatar: '',
    botBio: 'AI helper',
    conversationName: 'Chat AI',
  };

  await page.route('**/chat/ai/admin/config', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(aiConfig),
      });
      return;
    }

    const body = parseJsonBody(route);
    Object.assign(aiConfig, body);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, config: aiConfig, message: 'Đã cập nhật cấu hình AI chat' }),
    });
  });

  await page.route('**/chat/ai/admin/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        days: 7,
        total: {
          totalConversations: 120,
          userMessages: 420,
          aiReplies: 260,
          activeUsers: 88,
          aiCommentOpeners: 12,
          aiAutoReplies: 34,
        },
        period: {
          totalConversations: 18,
          userMessages: 52,
          aiReplies: 31,
          activeUsers: 11,
          aiCommentOpeners: 4,
          aiAutoReplies: 6,
        },
      }),
    });
  });

  await page.route('**/chat/ai/admin/avatar', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        key: 'avatars/ai.png',
        viewUrl: 'https://example.com/ai-avatar.png',
        expiresIn: 3600,
      }),
    });
  });

  return aiConfig;
}
