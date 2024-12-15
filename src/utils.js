import { text } from "@clack/prompts";

export const isValidUrl = (urlString) => {
    try {
        return Boolean(new URL(urlString));
    }
    catch (e) {
        return false;
    }
}


export const askQuestion = async () => {
    return text({
        message: 'Question:',
        validate(value) {
            if (value.length === 0) return `Question is required!`;
        },
    })
}

export const askWebsiteURL = async () => {
    return text({
        message: 'Insert article link?',
        validate(value) {
            if (value.length === 0) return `Value is required!`;
            if (!isValidUrl(value)) return `URL not valid`
        },
    });
}