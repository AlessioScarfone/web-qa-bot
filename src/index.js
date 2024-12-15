import * as dotenv from 'dotenv'
import { confirm, intro, log, outro, spinner } from '@clack/prompts';
import { askQuestion, askWebsiteURL } from './utils.js';
import { buildRetrievalChain } from './ai/retrieval-chain.js';
import { buildHistoryRetrievalChain } from './ai/chat-history-retrieval-chain.js';

dotenv.config()
const s = spinner();

intro(`Q&A on a website: start`);

const webSite = await askWebsiteURL()

const enableLog = await confirm({
    message: 'Do you want to enable log?',
    initialValue: false
});

s.start("Build AI Helper")
// const ai = await buildRetrievalChain(webSite)
const ai = await buildHistoryRetrievalChain(webSite)
s.stop("AI Helper Ready")


let question = "";
while (question != 'end') {
    question = String(await askQuestion());
    if (question == 'end') {
        break;
    }
    const response = await ai.invokeAI(question, Boolean(enableLog));
    log.success(`${response}`)
}

outro(`Q&A on a website: End`);



