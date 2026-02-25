import axios from 'axios';
import { ApiErrorResponse } from '../types/api';

export function getApiErrorMessage(error: unknown, fallback = 'Nao foi possivel concluir a solicitacao.') {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.status === 429) {
      return 'Muitas requisicoes em sequencia. Aguarde alguns segundos e tente novamente.';
    }
    const payload = error.response?.data;
    const payloadText = JSON.stringify(payload ?? {}).toLowerCase();
    const hasLimitValidation =
      payloadText.includes('"path":["limit"]') ||
      payloadText.includes('less than or equal to 100') ||
      payloadText.includes('"code":"too_big"');
    if (hasLimitValidation) {
      return 'A API rejeitou o limite solicitado. Ajustamos para o valor maximo permitido e voce pode tentar novamente.';
    }
    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
    if (typeof payload?.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

