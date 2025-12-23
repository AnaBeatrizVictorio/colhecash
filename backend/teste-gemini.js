require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listarModelos() {
  try {
    console.log(
      "🔑 API Key:",
      process.env.GEMINI_API_KEY ? "Configurada" : "NÃO configurada"
    );
    console.log("\n📋 Listando modelos disponíveis...\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    const data = await response.json();

    if (data.models) {
      console.log(`✅ Encontrados ${data.models.length} modelos:\n`);

      data.models.forEach((model) => {
        console.log(`📌 ${model.name}`);
        console.log(
          `   Suporta: ${model.supportedGenerationMethods?.join(", ")}`
        );
        console.log("");
      });

      // Testar o primeiro modelo que suporta generateContent
      const modeloCompativel = data.models.find((m) =>
        m.supportedGenerationMethods?.includes("generateContent")
      );

      if (modeloCompativel) {
        console.log(`\n🧪 Testando modelo: ${modeloCompativel.name}\n`);

        const model = genAI.getGenerativeModel({
          model: modeloCompativel.name,
        });
        const result = await model.generateContent("Diga olá em português");
        const response = await result.response;

        console.log("✅ FUNCIONOU!");
        console.log("Resposta:", response.text());
        console.log(
          `\n✨ Use este modelo no IAService.js: "${modeloCompativel.name}"`
        );
      }
    } else {
      console.error("❌ Erro na resposta:", data);
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

listarModelos();
