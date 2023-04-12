import express, { Request } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { ChatGPTAPI } from 'chatgpt';
import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  res.status(status).send({ error: message });
};

async function getChatGPTAPI(): Promise<ChatGPTAPI> {
  const apiKey = "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";

  if (!apiKey) {
    throw new Error('Missing OpenAI API key. Please provide OPENAI_API_KEY as an env variable.');
  }

  const api = new ChatGPTAPI({ apiKey });

  return api;
}

interface CreateChatGPTMessageRequestBody {
  text: string;
  parentMessageId?: string;
}

interface CreateChatGPTMessageResponse {
  answer: string;
  messageId: string;
}

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('MathGPT server is running OK');
});

app.post(
  '/chatgpt/messages',
  async (
    req: Request<
      {},
      CreateChatGPTMessageResponse,
      CreateChatGPTMessageRequestBody
    >,
    res,
    next,
  ) => {
    const api = await getChatGPTAPI();
    const { text, parentMessageId } = req.body;

    try {
      const response = await api.sendMessage(text, {
        parentMessageId,
      });
      res.json({
        answer: response.text,
        messageId: response.id,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return next(error);
      }
      const errorMessage = typeof error === 'string' ? error : 'Something went wrong';
      return next(new Error(errorMessage));
    }
  },
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
