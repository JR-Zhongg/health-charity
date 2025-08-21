import { ref } from 'vue';

// From environment variables
const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
const apiUrl = 'https://api.deepseek.com/chat/completions';

// ✅ Define interfaces for the API response to avoid using 'any'
interface DeepSeekChoice {
  message: {
    content: string;
  };
}

interface DeepSeekResponse {
  choices: DeepSeekChoice[];
}

interface DeepSeekError {
  error?: {
    message?: string;
  }
}

export function useAi() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Generates a resource summary based on a title and category.
   * @param title The title of the resource.
   * @param category The category of the resource.
   * @returns The generated summary text.
   */
  async function generateSummary(title: string, category: string): Promise<string> {
    isLoading.value = true;
    error.value = null;

    if (!apiKey) {
      error.value = 'DeepSeek API key is not configured.';
      isLoading.value = false;
      throw new Error(error.value);
    }

    const prompt = `You are a helpful assistant for a health charity website. Your task is to write a concise and informative summary for a health resource.
      The summary should be around 20-30 words, easy to understand for seniors.
      Resource Title: "${title}"
      Resource Category: "${category}"
      Please provide only the summary text, without any introductory phrases.`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 100,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData: DeepSeekError = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch from DeepSeek API.');
      }

      const data: DeepSeekResponse = await response.json();
      const summary = data.choices[0]?.message?.content?.trim();

      if (!summary) {
        throw new Error("The AI returned an empty summary.");
      }

      return summary;

    } catch (err) { // ✅ Use 'unknown' type for better error handling
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'An unknown error occurred.';
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    generateSummary
  };
}
