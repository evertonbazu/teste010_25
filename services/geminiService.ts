// FIX: Use `GoogleGenAI` instead of the deprecated `GoogleGenerativeAI`.
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from environment variables.
// FIX: Use `GoogleGenAI` instead of the deprecated `GoogleGenerativeAI`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Define the expected JSON schema for the model's response.
// This ensures the output is structured and predictable.
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: {
            type: Type.BOOLEAN,
            description: 'If the student\'s answer is correct, considering minor variations like "R$ 5" vs "5.00".'
        },
        feedback: {
            type: Type.STRING,
            description: 'A short, encouraging, and educational feedback for the student in Portuguese (max 3 sentences).'
        }
    },
    required: ['isCorrect', 'feedback']
};

interface GeminiFeedbackResponse {
    isCorrect: boolean;
    feedback: string;
}

export const getFeedbackForAnswer = async (question: string, correctAnswer: string, userAnswer: string): Promise<{ status: 'success', data: GeminiFeedbackResponse } | { status: 'error', message: string }> => {
    const prompt = `
        Você é um professor de matemática amigável e encorajador para alunos do 5º ano do ensino fundamental.
        Sua tarefa é avaliar a resposta de um aluno para uma pergunta de matemática.

        **Pergunta:** "${question}"
        **Resposta Correta Esperada:** "${correctAnswer}"
        **Resposta do Aluno:** "${userAnswer}"

        **Instruções:**
        1.  **Avalie a Correção:** Determine se a "Resposta do Aluno" está matematicamente correta. Respostas como "5", "5,00", "R$ 5", "R$ 5,00" ou "cinco" devem ser consideradas corretas se o valor numérico for 5. Seja flexível com formatação.
        2.  **Crie o Feedback:**
            *   **Se Correto:** Parabenize o aluno de forma calorosa (Ex: "Excelente!", "Isso mesmo!", "Parabéns!"). Em seguida, reforce brevemente o conceito matemático de forma simples.
            *   **Se Incorreto:** Diga que a resposta não está correta de uma forma gentil (Ex: "Quase lá!", "Ops, não foi dessa vez."). Em seguida, explique o erro de forma clara e simples e mostre como chegar à resposta correta.
        3.  **Linguagem:** Use português do Brasil, em um tom positivo e motivador. O feedback deve ser curto (no máximo 3 frases).
        4.  **Formato de Saída:** Responda estritamente no formato JSON com as chaves "isCorrect" (booleano) e "feedback" (string).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });
        
        const jsonStr = response.text.trim();
        const parsedResult: GeminiFeedbackResponse = JSON.parse(jsonStr);
        return {
            status: 'success',
            data: parsedResult
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { 
            status: 'error', 
            message: 'Não foi possível obter a correção da IA.'
        };
    }
};

export const getHintForQuestion = async (question: string): Promise<{ status: 'success', hint: string } | { status: 'error', message: string }> => {
    const prompt = `
        Você é um professor de matemática amigável para alunos do 5º ano.
        Um aluno pediu uma dica para a seguinte pergunta de matemática.

        **Pergunta:** "${question}"

        **Instruções:**
        1.  **NÃO DÊ A RESPOSTA FINAL.**
        2.  Forneça uma dica útil que guie o aluno na direção certa.
        3.  A dica pode ser uma pergunta-guia, o primeiro passo da resolução, ou uma forma mais simples de pensar sobre o problema.
        4.  Mantenha a linguagem simples, positiva e encorajadora.
        5.  A dica deve ser curta (1 ou 2 frases).
        6.  Responda apenas com o texto da dica em português do Brasil.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        const hint = response.text.trim();
        if (!hint) {
            throw new Error("Empty hint response from API");
        }

        return {
            status: 'success',
            hint: hint
        };

    } catch (error) {
        console.error("Error calling Gemini API for hint:", error);
        return { 
            status: 'error', 
            message: 'Não foi possível obter uma dica da IA no momento.'
        };
    }
};
