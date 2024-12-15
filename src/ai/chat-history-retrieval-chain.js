import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { loadWebPage } from './web-loader.js';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { googleModel } from './model.js';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

const chatHistory = [
];


export async function buildHistoryRetrievalChain(articleUrl) {

    const vectorstore = await loadWebPage(articleUrl)

    const contextualizeQSystemPrompt =
        "Given a chat history and the latest user question " +
        "which might reference context in the chat history, " +
        "formulate a standalone question which can be understood " +
        "without the chat history. Do NOT answer the question, " +
        "just reformulate it if needed and otherwise return it as is.";

    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
        ["system", contextualizeQSystemPrompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
    ]);

    //Create a chain that takes conversation history and returns documents.
    //The prompt and LLM will be used to generate a search query. 
    //That search query is then passed to the retriever.
    const historyAwareRetriever = await createHistoryAwareRetriever({
        llm: googleModel,
        retriever: vectorstore.asRetriever(),
        rephrasePrompt: contextualizeQPrompt,
    });


    const systemPrompt = `
        You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. 
        If you don't know the answer, just say that you don't know. 
        Context: {context}`

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
    ])

    const questionAnswerChain = await createStuffDocumentsChain({
        llm: googleModel,
        prompt,
    });

    // Create the conversation chain. It will combine the retrieverChain
    // and StuffChain in order to get an answer
    const ragChain = await createRetrievalChain({
        retriever: historyAwareRetriever,
        combineDocsChain: questionAnswerChain,
    });


    return {
        invokeAI: async (input, log = false) => {
            const resp = await ragChain.invoke({
                input,
                chat_history: chatHistory
            });
            chatHistory.push(new HumanMessage(input))
            chatHistory.push(new AIMessage(resp.answer))
            if (log) {
                console.log("Response:", resp);
                console.log("History length:", chatHistory.length);
            }
            return resp.answer;
        }
    }


}