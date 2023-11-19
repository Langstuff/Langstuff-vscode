import * as vscode from 'vscode';
import http from 'http';

async function makeGpt4Request(userMessage: string, systemMessage?: string): Promise<string> {
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
				resolve(response);
			});
		});

		req.on('error', (error: any) => {
			reject(error);
		});

		req.write(data);
		req.end();
	});
}

export async function activate(context: vscode.ExtensionContext) {
	console.log('Extension "langstuff" is now active!');

	let addText = (document: vscode.TextDocument, text: string) => (edit: vscode.TextEditorEdit) => {
		edit.insert(new vscode.Position(document.lineCount, 0), "=====\n");
		edit.insert(new vscode.Position(document.lineCount, 0), text);
		edit.insert(new vscode.Position(document.lineCount, 0), "\n");
	}

	var newDoc: vscode.TextDocument;

	async function showAiResponse(text: string) {
		if (newDoc == null || newDoc.isClosed) {
			newDoc = await vscode.workspace.openTextDocument();
		}
		if (newDoc == vscode.window.activeTextEditor?.document) {
			var document = vscode.window.activeTextEditor?.document;
			vscode.window.activeTextEditor.edit(addText(document, text));
		} else {
			await vscode.window.showTextDocument(newDoc, vscode.ViewColumn.Beside).then(e => {
				e.edit(addText(e.document, text));
			})
		}
	}

	let getCurrentEditorSelection = (): string | null => {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		if (selection && !selection.isEmpty) {
			const selectionRange = new vscode.Range(
				selection.start.line,
				selection.start.character,
				selection.end.line,
				selection.end.character
			);
			return editor.document.getText(selectionRange);
		}
		return null;
	}

	let makeAiRequestCommand = (useSelection: boolean, askSystemMessage: boolean) =>
		async () => {
			const userMessage = useSelection ? getCurrentEditorSelection() :
				await vscode.window.showInputBox({
					prompt: 'Enter the request:',
					placeHolder: 'Request'
				});

			const systemMessage = askSystemMessage ? await vscode.window.showInputBox({
				prompt: 'Enter the text request:',
				placeHolder: 'Text Request'
			}) : undefined;
			if (userMessage) {
				try {
					const generatedText = await makeGpt4Request(userMessage, systemMessage);
					showAiResponse(generatedText);
				} catch (error) {
					vscode.window.showErrorMessage('Failed to make request: ' + error);
				}
			}
		}

	let subscriptionAiProcessSelection = vscode.commands
		.registerCommand('langstuff.aiProcessSelection',
			makeAiRequestCommand(true, false));

	context.subscriptions.push(subscriptionAiProcessSelection);

	let subscriptionAiProcessSelectionWithRequest = vscode.commands
		.registerCommand('langstuff.aiProcessSelectionWithRequest',
			makeAiRequestCommand(true, true));

	context.subscriptions.push(subscriptionAiProcessSelectionWithRequest);

	let subscriptionAiRequest = vscode.commands.registerCommand('langstuff.aiRequest',
		makeAiRequestCommand(false, false));

	context.subscriptions.push(subscriptionAiRequest);
}

export function deactivate() { }
