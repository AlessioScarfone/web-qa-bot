import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function loadWebPage(url, splitterConf = { chunkSize: 300, chunkOverlap: 0 }) {
    const loader = new CheerioWebBaseLoader(url, {
        selector: 'body'
    });
    //download web page
    const rawDocs = await loader.load();
    const docs = rawDocs.map(d => {
        const pageContent = d.pageContent.replace(/\s+/g, " ");
        return {
            ...d,
            pageContent
        }
    })
    //split it in chunk
    const textSplitter = new RecursiveCharacterTextSplitter(splitterConf);
    const docSplit = await textSplitter.splitDocuments(docs);
    // console.table({ rawDocs: rawDocs.length, docSplit: docSplit.length })

    // Create Vector Store
    const embeddings = new GoogleGenerativeAIEmbeddings();
    const vectorstore = await MemoryVectorStore.fromDocuments(
        docSplit,
        embeddings
    );

    return vectorstore;
}