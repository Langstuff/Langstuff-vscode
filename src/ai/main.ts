import * as http from 'http';
async function makeAiRequest(userMessage: string, systemMessage?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            userMessage: userMessage,
            systemMessage: systemMessage
        });

        const options = {
            hostname: '127.0.0.1',
            port: '8080',
            path: '/ai',
            method: 'POST',
        };

        const req = http.request(options, (res: any) => {
            let response = '';

            res.on('data', (chunk: any) => {
                response += chunk;
            });

            res.on('end', async () => {
                resolve(JSON.parse(response).response);
            });
        });

        req.on('error', (error: any) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

export default makeAiRequest;
