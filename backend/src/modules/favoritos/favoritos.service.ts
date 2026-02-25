import { AppError } from "../../shared/errors/app-error";
import { DeputadosRepository } from "../deputados/deputados.repository";
import { FavoritosRepository } from "./favoritos.repository";

export class FavoritosService {
  private readonly repository = new FavoritosRepository();
  private readonly deputadosRepository = new DeputadosRepository();

  async list(userId: string) {
    return this.repository.listByUser(userId);
  }

  async create(userId: string, deputyId: number) {
    const deputy = await this.deputadosRepository.findById(deputyId);
    if (!deputy) {
      throw new AppError("Deputado nao encontrado", 404, "DEPUTY_NOT_FOUND");
    }

    try {
      return await this.repository.create(userId, deputyId);
    } catch {
      throw new AppError("Deputado ja favoritado", 409, "FAVORITE_ALREADY_EXISTS");
    }
  }

  async remove(userId: string, deputyId: number) {
    await this.repository.deleteByUserAndDeputy(userId, deputyId);
    return { removed: true };
  }
}
