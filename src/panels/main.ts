import * as vscode from "vscode";
import { Disposable, Webview, window } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import makeAiRequest from "../ai/main";

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
    };
}

export class SomeProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _disposables: Disposable[] = [];
    private messages: String[] = [];

    constructor(private readonly _context: vscode.ExtensionContext) { }

    resolveWebviewView(webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken) {
        this._view = webviewView;
        const webview = webviewView.webview;
        const extensionUri = this._context.extensionUri;
        const webviewUri = getUri(this._view.webview, extensionUri, ["out", "webview.js"]);
        const nonce = getNonce();
        this._setWebviewMessageListener(webview);

        webview.options = getWebviewOptions(this._context.extensionUri);

        webview.html = /*html*/ `
        <!DOCTYPE html>
        <html style="width: 100%; height: 100%;">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none';
                style-src 'nonce-${nonce}' ${webview.cspSource};
                script-src 'nonce-${nonce}';">
            <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            <style nonce="${nonce}">
                #extension-root {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }

                .bottom-input {
                    display: inline-flex;
                    margin-top: auto;
                    height: auto;
                }

                #chat-input {
                    flex: 1;
                }

                #send-chat {
                    height: 30px;
                }

                #message-container {
                    overflow-y: auto;
                }
            </style>
            <title>Langstuff chat</title>
        </head>
        
        <body>
            <div id="extension-root" class="message-container">
                <div id="message-container">
                </div>
                <form id="chat-submit" class="bottom-input">
                    <vscode-text-area id="chat-input"></vscode-text-area>
                </form>
            </div>
        </body>
        
        </html>
		`;
    }

    private _setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const text = message.text;

                switch (command) {
                    case "showInfoMessage":
                        window.showInformationMessage(text);
                        return;
                    case "sendAiRequest":
                        makeAiRequest(text).then((ret) => {
                            this.addMessage(ret);
                        });
                        return;
                    case "requestMessages":
                        this.sendCommandToWebview({
                            type: 'updateMessages',
                            message: this.messages,
                        });
                        return;
                }
            },
            undefined,
            this._disposables
        );
    }

    public addMessage(message: string) {
        this.messages.push(message);
        this.sendCommandToWebview({
            type: 'updateMessages',
            message: this.messages,
        });
    }

    public sendCommandToWebview(message: { type: string, message: any }) {
        vscode.window.showInformationMessage(message.message);
        this._view?.webview.postMessage(message);
    }
}
