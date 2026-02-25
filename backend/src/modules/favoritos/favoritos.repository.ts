import { prisma } from "../../infra/db/prisma";

export class FavoritosRepository {
  listByUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      include: {
        deputy: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  create(userId: string, deputyId: number) {
    return prisma.favorite.create({
      data: { userId, deputyId }
    });
  }

  deleteByUserAndDeputy(userId: string, deputyId: number) {
    return prisma.favorite.deleteMany({
      where: { userId, deputyId }
    });
  }
}
