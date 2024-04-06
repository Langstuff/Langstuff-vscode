import * as vscode from 'vscode';
import { SomeProvider } from "./panels/main";
import makeAiRequest from "./ai/main";

function createChatProvider(context: vscode.ExtensionContext) {
	var provider = new SomeProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("langstuff.chat", provider));
	return provider;
}

export async function activate(context: vscode.ExtensionContext) {
	console.log('Extension "langstuff" is now active!');
	var chatProvider = createChatProvider(context);
	var lastRequestText: string = "";

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
	};

	let processCommand = (msg: string): string => {
		if (msg.startsWith("/tr")) {
			msg = msg.replace("/tr", "Translate");
		}
		return msg;
	};

	let makeAiRequestCommand = (useSelection: boolean, askSystemMessage: boolean) =>
		async () => {
			const userMessage = useSelection ? getCurrentEditorSelection() :
				await vscode.window.showInputBox({
					value: lastRequestText,
					prompt: 'Enter the request:',
					placeHolder: 'Request'
				});

			if (!userMessage) {
				return;
			}
			if (!useSelection) {
				lastRequestText = userMessage;
			}

			const systemMessage = askSystemMessage ? await vscode.window.showInputBox({
				value: lastRequestText,
				prompt: 'Enter the text request:',
				placeHolder: 'Text Request'
			}) : undefined;
			if (askSystemMessage && !systemMessage) {
				return;
			}

			if (useSelection) {
				lastRequestText = systemMessage || "";
			}

			var processedSystemMessage = systemMessage;
			if (systemMessage?.startsWith("/")) {
				processedSystemMessage = processCommand(systemMessage);
			}

			try {
				const generatedText = await makeAiRequest(userMessage, processedSystemMessage);
				chatProvider.addMessage(generatedText);
			} catch (error) {
				vscode.window.showErrorMessage('Failed to make request: ' + error);
			}
		};

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
