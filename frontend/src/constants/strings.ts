export const CALENDAR_MONTH_OPTIONS = [
  { label: 'Janeiro', value: '1' },
  { label: 'Fevereiro', value: '2' },
  { label: 'Março', value: '3' },
  { label: 'Abril', value: '4' },
  { label: 'Maio', value: '5' },
  { label: 'Junho', value: '6' },
  { label: 'Julho', value: '7' },
  { label: 'Agosto', value: '8' },
  { label: 'Setembro', value: '9' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' },
] as const;

export const UI_STRINGS = {
  deputados: {
    totalGeralDoMes: 'Total geral do mês',
    seletorMes: 'Mês',
    revalidateRateLimit: 'Muitas requisições. Aguardando {seconds}s para retomar.',
  },
  deputadoDetalhe: {
    totalNoMes: 'Total no mês',
    evolucaoMensalNoAno: 'Evolução mensal no ano',
    seletorMes: 'Mês',
    semDespesas: 'Sem despesas',
    semDespesasDescricao: 'Não há gastos registrados para o período selecionado.',
  },
} as const;
