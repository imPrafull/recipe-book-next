import { rest } from 'msw';
import { mockUsers, createUser, createAuthTokens, validateToken } from '../fixtures';
import type { User } from '../fixtures';

const BASE_URL = '/api';

// In-memory user database for testing
const users = new Map<string, User & { password: string }>();

// Initialize with test user
users.set('test@example.com', {
  ...mockUsers.testUser,
  password: 'password123',
});

export const authHandlers = [
  // POST /auth/signup - Create new user
  rest.post(`${BASE_URL}/auth/signup`, async (req, res, ctx) => {
    const body = await req.json() as { email: string; password: string; name: string };
    
    // Validate input
    if (!body.email || !body.password || !body.name) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: 'Email, password, and name are required',
        })
      );
    }
    
    // Check if user already exists
    if (users.has(body.email)) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: 'User with this email already exists',
        })
      );
    }
    
    // Create new user
    const newUser = createUser({
      id: `user-${Date.now()}`,
      email: body.email,
      name: body.name,
    });
    
    users.set(body.email, {
      ...newUser,
      password: body.password,
    });
    
    const tokens = createAuthTokens(newUser.id);
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          user: newUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      })
    );
  }),

  // POST /auth/login - Authenticate user
  rest.post(`${BASE_URL}/auth/login`, async (req, res, ctx) => {
    const body = await req.json() as { email: string; password: string };
    
    // Validate input
    if (!body.email || !body.password) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: 'Email and password are required',
        })
      );
    }
    
    // Find user
    const user = users.get(body.email);
    
    if (!user || user.password !== body.password) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Invalid email or password',
        })
      );
    }
    
    const tokens = createAuthTokens(user.id);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return res(
      ctx.json({
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      })
    );
  }),

  // GET /auth/me - Get current user
  rest.get(`${BASE_URL}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Authentication required',
        })
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const validation = validateToken(token);
    
    if (!validation.valid) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Invalid token',
        })
      );
    }
    
    if (validation.expired) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Access token expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED',
        })
      );
    }
    
    // Find user by ID from token
    const user = Array.from(users.values()).find(u => u.id === validation.userId);
    
    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'User not found',
        })
      );
    }
    
    const { password, ...userWithoutPassword } = user;
    
    return res(
      ctx.json({
        success: true,
        data: {
          user: userWithoutPassword,
        },
      })
    );
  }),

  // PATCH /auth/me - Update user profile
  rest.patch(`${BASE_URL}/auth/me`, async (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Authentication required',
        })
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const validation = validateToken(token);
    
    if (!validation.valid || validation.expired) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: validation.expired ? 'Access token expired. Please refresh your token.' : 'Invalid token',
          code: validation.expired ? 'TOKEN_EXPIRED' : undefined,
        })
      );
    }
    
    const body = await req.json() as Partial<User>;
    
    // Find and update user
    const userArray = Array.from(users.entries());
    const userEntry = userArray.find(([_, u]) => u.id === validation.userId);
    
    if (!userEntry) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'User not found',
        })
      );
    }
    
    const [email, user] = userEntry;
    const updatedUser = {
      ...user,
      ...body,
      id: user.id, // Prevent ID from being changed
      email: user.email, // Prevent email from being changed
    };
    
    users.set(email, updatedUser);
    
    const { password, ...userWithoutPassword } = updatedUser;
    
    return res(
      ctx.json({
        success: true,
        data: {
          user: userWithoutPassword,
        },
      })
    );
  }),

  // POST /auth/logout - Logout user
  rest.post(`${BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      })
    );
  }),

  // POST /auth/refresh - Refresh access token
  rest.post(`${BASE_URL}/auth/refresh`, async (req, res, ctx) => {
    const body = await req.json() as { refreshToken: string };
    
    if (!body.refreshToken) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: 'Refresh token is required',
        })
      );
    }
    
    const validation = validateToken(body.refreshToken);
    
    if (!validation.valid || validation.expired) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Invalid or expired refresh token',
        })
      );
    }
    
    // Generate new token pair
    const newTokens = createAuthTokens(validation.userId!);
    
    return res(
      ctx.json({
        success: true,
        data: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
        },
      })
    );
  }),
];
