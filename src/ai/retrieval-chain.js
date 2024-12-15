import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { loadWebPage } from './web-loader.js';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { googleModel } from './model.js';

export async function buildRetrievalChain(articleUrl) {

    // Create prompt - https://smith.langchain.com/hub/rlm/rag-prompt
    const prompt = ChatPromptTemplate.fromTemplate(
        `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know.
        Question: {input} 
        Context: {context} 
        Answer:`
    );

    // Create Chain
    const chain = await createStuffDocumentsChain({
        llm: googleModel,
        prompt,
        outputParser: new StringOutputParser()
    });

    const vectorstore = await loadWebPage(articleUrl)

    // Create a retrieval chain
    const retrievalChain = await createRetrievalChain({
        combineDocsChain: chain,
        retriever: vectorstore.asRetriever({ k: 2 })
    });

    return {
        invokeAI: async (input, log = false) => {
            const resp = await retrievalChain.invoke({
                input,
            });
            if (log) {
                console.log("Response", resp);
            }
            return resp.answer;
        }
    }
}