import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import { UsersRepository } from "../users/users.repository";
import { RefreshTokenRepository } from "./refresh-token.repository";
import type { LoginPayload } from "./auth.types";
import { verifyGoogleToken } from "../../services/googleAuthService";

type TokenPayload = {
  sub: string;
  email: string;
};

export class AuthService {
  private readonly usersRepository = new UsersRepository();
  private readonly refreshTokenRepository = new RefreshTokenRepository();

  constructor(private readonly app: FastifyInstance) {}

  private hashToken(raw: string): string {
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  private async issueTokens(payload: TokenPayload) {
    const accessToken = await this.app.jwt.sign(payload, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: `${env.JWT_REFRESH_EXPIRES_DAYS}d`
    });

    await this.refreshTokenRepository.create({
      userId: payload.sub,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
    });

    return { accessToken, refreshToken };
  }

  private serializeUser(user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    avatarUrl?: string | null;
    profile?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    } | null;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl ?? user.profile?.avatarUrl ?? null,
      profile: user.profile
        ? {
            userId: user.id,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatarUrl: user.profile.avatarUrl ?? user.avatarUrl ?? null,
          }
        : undefined,
    };
  }

  private splitName(name: string) {
    const normalized = name.trim().replace(/\s+/g, " ");
    const [firstName = "", ...rest] = normalized.split(" ");
    return {
      firstName: firstName || "Google",
      lastName: rest.join(" ").trim() || "User",
    };
  }

  async register(input: { firstName: string; lastName: string; email: string; password: string }) {
    const existing = await this.usersRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email ja cadastrado", 409, "EMAIL_IN_USE");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const fullName = `${input.firstName} ${input.lastName}`.trim();
    const user = await this.usersRepository.createWithProfile({
      name: fullName,
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      firstName: (user as any).profile?.firstName ?? input.firstName,
      lastName: (user as any).profile?.lastName ?? input.lastName,
      createdAt: user.createdAt
    };
  }

  async login(input: LoginPayload) {
    const user = await this.usersRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError("Credenciais invalidas", 401, "INVALID_CREDENTIALS");
    }
    if (!user.passwordHash) {
      throw new AppError("Esta conta utiliza login social. Entre com Google.", 401, "PASSWORD_LOGIN_UNAVAILABLE");
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError("Credenciais invalidas", 401, "INVALID_CREDENTIALS");
    }

    return this.issueTokens({ sub: user.id, email: user.email });
  }

  async loginWithGoogle(input: { idToken: string }) {
    const payload = await verifyGoogleToken(input.idToken);
    const emailValue = payload.email;
    if (!emailValue) {
      throw new AppError("Token Google invalido", 401, "INVALID_GOOGLE_TOKEN");
    }
    const email = emailValue.trim().toLowerCase();
    const name = payload.name?.trim() || email.split("@")[0] || "Google User";
    const avatarUrl = payload.picture ?? null;
    const googleId = payload.sub;
    const { firstName, lastName } = this.splitName(name);

    let user = await this.usersRepository.findByGoogleId(googleId);

    if (!user) {
      user = await this.usersRepository.findByEmail(email);
      if (user) {
        user = await this.usersRepository.update(user.id, {
          googleId,
          avatarUrl,
        });
      }
    } else if (user.email !== email) {
      const userWithEmail = await this.usersRepository.findByEmail(email);
      if (!userWithEmail || userWithEmail.id === user.id) {
        user = await this.usersRepository.update(user.id, {
          email,
          name,
          avatarUrl,
        });
      }
    }

    if (!user) {
      user = await this.usersRepository.create({
        name,
        email,
        passwordHash: null,
        googleId,
        avatarUrl,
        provider: "google",
      });
    } else {
      user = await this.usersRepository.update(user.id, {
        name,
        avatarUrl,
        googleId,
      });
    }

    await this.usersRepository.upsertProfileByUserId(user.id, {
      firstName,
      lastName,
      avatarUrl,
    });

    const profile = await this.usersRepository.getProfileByUserId(user.id);
    const tokens = await this.issueTokens({ sub: user.id, email: user.email });

    return {
      user: this.serializeUser({
        ...user,
        profile,
      }),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError("Refresh token invalido", 401, "INVALID_REFRESH_TOKEN");
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findValidToken(tokenHash);
    if (!stored) {
      throw new AppError("Refresh token invalido ou revogado", 401, "INVALID_REFRESH_TOKEN");
    }

    const user = await this.usersRepository.findById(stored.userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
    }

    await this.refreshTokenRepository.revokeByHash(tokenHash);
    return this.issueTokens({ sub: user.id, email: user.email });
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenRepository.revokeByHash(tokenHash);
    return { loggedOut: true };
  }

  async me(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: (user as any).avatarUrl ?? null,
      createdAt: user.createdAt,
    };
  }
}
