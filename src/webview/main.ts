import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    TextArea,
    vsCodeTextArea,
    vsCodeTextField,
    vsCodeDivider,
} from "@vscode/webview-ui-toolkit";
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import MarkdownIt from "markdown-it";

const md: MarkdownIt = markdownit({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre><code class="hljs">' +
                    hljs.highlight(str, { language: lang }).value +
                    '</code></pre>';
            } catch (__) { }
        }

        return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeTextArea(),
    vsCodeTextField(),
    vsCodeDivider(),
);

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function handleExtensionMessages(event: MessageEvent) {
    const { message, type } = event.data;

    switch (type) {
        case "updateMessages":
            drawMessages(message);
            break;
        case "addMessage":
            addMessage(message);
            break;
    }
};

window.addEventListener("message", handleExtensionMessages);

var messageContainer: HTMLElement | null = null;

function main() {
    var textArea = document.getElementById("chat-input") as TextArea;
    messageContainer = document.getElementById("message-container");

    textArea.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            var text = textArea.value;
            vscode.postMessage({
                command: "sendAiRequest",
                text: text,
            });
        }
    });
    vscode.postMessage({ command: "requestMessages" });
}

function addMessage(message: string) {
    var div = document.createElement("div");
    div.innerHTML = md.render(message);
    messageContainer?.appendChild(div);
    var divider = document.createElement("vscode-divider");
    messageContainer?.appendChild(divider);
}

function drawMessages(messages: string[]) {
    messageContainer!.innerHTML = "";
    messages.forEach(addMessage);
}
