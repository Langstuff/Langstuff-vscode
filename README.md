# Langstuff-vscode extension
Extension for [Langstuff-server](https://github.com/Langstuff/Langstuff-server).

The goal is to make a language learning assistant tool that:
* helps you manage notes and flashcards in Markdown
* provides an interface for flashcards inside VSCode
* answers language-related questions using LLM (large language model, such as GPT-4)
* provides an interface to work with dictionaries (even though LLM can translate text, it's not a dictionary and can't replace one)

It will also be able to export flashcards to formats used by other software, if that's preferred by the user.

For now, it can only make requests through Langstuff-server to whatever LLM it's using at the moment and print responses in a view similar to Copilot. User can make requests based on text selection (with possible additional prompt message) or from a chat input box. It currently doesn't keep context, so LLM doesn't remember chat history (may be changed in the future).

What led to the development of this was the disappointment in effectiveness of language learning software that contains any kind of "course" for language within it (looking at you, *owl app*) and also the wish to make flashcard creation easier and faster: bulk export from markdown lists, possibly asking LLM to translate the words, if you're brave enough to trust the translations.

# 3rd-party code
Libraries:
* [vscode-webview-ui-toolkit](https://github.com/microsoft/vscode-webview-ui-toolkit), MIT
* [markdown-it](https://github.com/markdown-it/markdown-it), MIT
* [highlight.js](https:////github.com/highlightjs/highlight.js), BSD-3-Clause

Other:
* This extension uses some code from [vscode-webview-ui-toolkit-samples](https://github.com/microsoft/vscode-webview-ui-toolkit-samples), MIT
