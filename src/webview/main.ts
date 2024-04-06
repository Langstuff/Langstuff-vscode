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
import { Message } from "../interfaces";

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

function cutString(str: string, max: number) {
    if (str.length > max) {
        return str.substring(0, max) + "…";
    }
    return str;
}

function addMessage(message: Message) {
    let { response, systemMessage, userMessage } = message;
    systemMessage = systemMessage;

    var div = document.createElement("div");

    var summary = document.createElement("div");
    summary.classList.add("summary");
    if (systemMessage) {
        summary.innerHTML = `> ${cutString(systemMessage, 10)} / ${cutString(userMessage, 20)}`;
    } else {
        summary.innerHTML = `> ${cutString(userMessage, 20)}`;
    }
    div.appendChild(summary);

    var details = document.createElement("div");
    details.classList.add("details");

    if (systemMessage) {
        details.innerHTML = `> ${systemMessage}<br>> ${userMessage}`;
    } else {
        details.innerHTML = `> ${userMessage}`;
    }
    details.style.display = "none";
    div.appendChild(details);

    div.addEventListener("click", () => {
        if (details.style.display === "none") {
            summary.style.display = "none";
            details.style.display = "block";
        } else {
            details.style.display = "none";
            summary.style.display = "block";
        }
    });

    messageContainer?.appendChild(div);

    var responseDiv = document.createElement("div");
    responseDiv.innerHTML = md.render(response);
    div.appendChild(responseDiv);

    var divider = document.createElement("vscode-divider");
    messageContainer?.appendChild(divider);
}

function drawMessages(messages: Message[]) {
    messageContainer!.innerHTML = "";
    messages.forEach(addMessage);
}
