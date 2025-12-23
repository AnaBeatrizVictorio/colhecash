const { GoogleGenerativeAI } = require("@google/generative-ai");

class IAService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY não configurada");
      this.genAI = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash"  // ✅ Modelo mais recente e rápido
    });

    console.log("🤖 IA Service inicializado com sucesso");
  }

  getSystemPrompt() {
    return `Você é o assistente financeiro inteligente do ColheCash, um aplicativo mobile focado em pequenos empreendedores rurais e urbanos.

SOBRE O COLHECASH:
- Aplicativo de gestão financeira simples e acessível
- Usuários: pequenos produtores, vendedores ambulantes, microempreendedores
- Foco: sustentabilidade financeira, autonomia, educação financeira
- Funcionalidades: controle de vendas, despesas, metas, relatórios

SEU PAPEL:
- Analisar dados financeiros do usuário
- Fornecer insights práticos e acionáveis
- Usar linguagem clara, acessível e empática
- Dar recomendações personalizadas baseadas nos dados reais
- Educar sobre finanças de forma simples
- Motivar e incentivar boas práticas financeiras

DIRETRIZES:
- Sempre baseie suas análises nos dados fornecidos
- Use exemplos concretos do negócio do usuário
- Seja positivo, mas honesto sobre desafios
- Sugira ações práticas e viáveis
- Evite jargões financeiros complexos
- Adapte o tom para pequenos empreendedores
- Celebre conquistas, mesmo pequenas
- Forneça contexto: compare com meses anteriores, metas, etc.

FORMATO DAS RESPOSTAS:
- Comece com um resumo claro da situação
- Use emojis para tornar mais amigável (📊💰✅⚠️)
- Organize em tópicos quando necessário
- Termine sempre com uma ação recomendada
- Mantenha respostas entre 150-400 palavras

Lembre-se: você está ajudando pessoas que lutam por autonomia financeira. Seja um parceiro confiável nessa jornada!`;
  }

  async analisarFinancas(dados) {
    if (!this.genAI) {
      throw new Error("IA não configurada. Configure GEMINI_API_KEY no .env");
    }

    try {
      const { vendas, despesas, meta, mesAnterior } = dados;

      const prompt = `${this.getSystemPrompt()}

DADOS DO USUÁRIO (MÊS ATUAL):
- Faturamento total: R$ ${vendas.total.toFixed(2)}
- Número de vendas: ${vendas.quantidade}
- Ticket médio: R$ ${vendas.ticketMedio.toFixed(2)}
- Despesas totais: R$ ${despesas.total.toFixed(2)}
- Lucro líquido: R$ ${(vendas.total - despesas.total).toFixed(2)}
- Margem de lucro: ${(
        ((vendas.total - despesas.total) / vendas.total) *
        100
      ).toFixed(1)}%
${meta ? `- Meta de faturamento: R$ ${meta.toFixed(2)}` : ""}
${
  meta
    ? `- Percentual da meta: ${((vendas.total / meta) * 100).toFixed(1)}%`
    : ""
}

${
  mesAnterior
    ? `COMPARAÇÃO COM MÊS ANTERIOR:
- Faturamento anterior: R$ ${mesAnterior.vendas.toFixed(2)}
- Variação: ${(
        ((vendas.total - mesAnterior.vendas) / mesAnterior.vendas) *
        100
      ).toFixed(1)}%
- Despesas anterior: R$ ${mesAnterior.despesas.toFixed(2)}
- Lucro anterior: R$ ${(mesAnterior.vendas - mesAnterior.despesas).toFixed(2)}`
    : ""
}

TOP 5 PRODUTOS MAIS VENDIDOS:
${vendas.topProdutos
  .map(
    (p, i) =>
      `${i + 1}. ${p.descricao} - ${p.quantidade} vendas - R$ ${p.total.toFixed(
        2
      )}`
  )
  .join("\n")}

PRINCIPAIS DESPESAS:
${despesas.categorias
  .map((c, i) => `${i + 1}. ${c.categoria} - R$ ${c.total.toFixed(2)}`)
  .join("\n")}

TAREFA:
Analise esses dados financeiros e forneça:
1. Um resumo da situação financeira atual (2-3 frases)
2. Principais pontos positivos (2-3 itens)
3. Pontos de atenção ou preocupação (1-2 itens)
4. Recomendações práticas e específicas (2-3 ações concretas)
5. Uma mensagem motivacional personalizada

Seja específico, use os dados reais do usuário, e mantenha o tom acessível e encorajador.`;

      console.log("🤖 Enviando dados para IA...");
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analise = response.text();

      console.log("✅ Análise gerada com sucesso");
      return analise;
    } catch (error) {
      console.error("❌ Erro ao gerar análise:", error);
      throw new Error("Não foi possível gerar a análise inteligente");
    }
  }

  async responderPergunta(pergunta, contextoFinanceiro) {
    if (!this.genAI) {
      throw new Error("IA não configurada");
    }

    try {
      const prompt = `${this.getSystemPrompt()}

CONTEXTO FINANCEIRO DO USUÁRIO:
${JSON.stringify(contextoFinanceiro, null, 2)}

PERGUNTA DO USUÁRIO:
${pergunta}

Responda de forma clara, prática e personalizada baseando-se nos dados financeiros reais do usuário. Use exemplos concretos do negócio dele.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("❌ Erro ao responder pergunta:", error);
      throw error;
    }
  }
}

module.exports = new IAService();
