import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import { UsersRepository } from "../users/users.repository";
import { RefreshTokenRepository } from "./refresh-token.repository";
import type { LoginPayload } from "./auth.types";

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

  async register(input: { name: string; email: string; password: string }) {
    const existing = await this.usersRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email ja cadastrado", 409, "EMAIL_IN_USE");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.usersRepository.createWithProfile({
      name: input.name,
      email: input.email,
      passwordHash
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  async login(input: LoginPayload) {
    const user = await this.usersRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError("Credenciais invalidas", 401, "INVALID_CREDENTIALS");
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError("Credenciais invalidas", 401, "INVALID_CREDENTIALS");
    }

    return this.issueTokens({ sub: user.id, email: user.email });
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
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  }
}
