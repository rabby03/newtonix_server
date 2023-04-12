import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './middlewares.js';
import { getChatGPTAPI } from './chatgpt.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const api = await getChatGPTAPI();
app.use(cors());
app.use(express.json());
app.use(errorHandler);
app.get('/', (req, res) => {
    res.send('MathGPT server is running OK');
});
app.post('/chatgpt/messages', async (req, res, next) => {
    const { text, parentMessageId } = req.body;
    try {
        const response = await api.sendMessage(text, {
            parentMessageId,
        });
        res.json({
            answer: response.text,
            messageId: response.id,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return next(error);
        }
        const errorMessage = typeof error === 'string' ? error : 'Something went wrong';
        return next(new Error(errorMessage));
    }
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map
