const vscode = require('vscode');
const fs = require('fs');
const dotenv = require('dotenv');
const axios = require('axios');


dotenv.config();

const endpoint = "";
const azureApiKey = "";

import('@azure/openai').then(({ OpenAIClient, AzureKeyCredential }) => {
  // Your code using OpenAI Client and AzureKeyCredential
}).catch(err => {
  console.error('Error importing @azure/openai:', err);
});

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	GetErrorData(context);
    AnalyzeErrorData(context);
    SuggestionGenerator(context, pairs)

	console.log('Congratulations, your extension "codehealer" is now active!');
	let disposable = vscode.commands.registerCommand('codehealer.heal', function () {
		vscode.window.showInformationMessage('Welcome to the codehealer!');
	});

	context.subscriptions.push(disposable);
}

/////////////////////////////////////////////////////////////////////////////////////

const errorMessages = [
  "Zero Division Error",
  "at /Users/r542/Desktop/test.txt"
];

const prompts = {
  Task: "In Microsoft Visual Studio Code, I was trying to run the following code, Your task is to analyze the provided source code and associated error message. Generate a detailed report including the total number of errors, reasons for each error, and the necessary changes to correct each error.",
  Context: "Imagine you are a software debugging assistant. Given the code and error message, provide a comprehensive analysis including the total number of errors, brief reasons for each error within 5 to 20 words, and the changes needed to fix each error.",
  Exemplars: "Just like a seasoned developer would analyze a piece of code, I want you to examine the given code and error message. Think about how you would count the total errors, describe each error in a few words, and suggest corrections. Remember, each correction should include the line number, the old text, and the new text.",
  Persona: "As an intelligent code debugging assistant, it's your job to dissect the given code and error message. Your response should include the total number of errors, a brief reason for each error, and the changes needed to rectify each error.",
  Format: "Please return a JSON object that includes the total number of errors, a list of reasons for each error (each reason should be succinct, between 5 and 20 words), and a list of changes to rectify each error. Each change should specify the line number, the old text, and the new text. Result : { total_errors : value, reasons : [reason1, reason2, …], changes : [ {line_number, old_text, new_text}, {line_number, old_text, new_text}, … ] } Without \\n included",
  Tone: "With a professional and analytical tone, examine the provided code and error message. Your response should include the total number of errors, a brief reason for each error, and the changes needed to correct each error."
};


function extractFilePaths(errorMessages) {
  const filePathsSet = new Set();
  const regex = /\/[^\s]+?\.[a-zA-Z]+/g;

  errorMessages.forEach(function (errorMessage) {
      const matches = errorMessage.match(regex);
      if (matches) {
          matches.forEach(function (match) {
              filePathsSet.add(match);
          });
      }
  });
  return Array.from(filePathsSet);
}

function readFile(path, callback) {
  fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
          console.error("Could not read file:", err);
          callback(err);
      } else {
          callback(null, data);
      }
  });
}

function getSourceCode(filePaths) {
  const fileContents = [];
  let filesToRead = filePaths.length;

  filePaths.forEach(function (filePath) {
      readFile(filePath, function (err, content) {
          if (err) {
              
          }
          else {
              fileContents.push(content);
          }
      });
  });
  return fileContents;
}

function OpenAI(Prompt) {
  const data = JSON.stringify({
      "messages": [
          {
              "role": "system",
              "content": Prompt
          }
      ],
      "max_tokens": 800,
      "temperature": 0.7,
      "frequency_penalty": 0,
      "presence_penalty": 0,
      "top_p": 0.95,
      "stop": null
  });

  const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: endpoint,
      headers: {
          'Content-Type': 'application/json',
          'api-key': azureApiKey
      },
      data: data
  };

  axios.request(config)
      .then(function (response) {
          const result = response.data.choices.map(choice => choice.message.content)[0];
          console.log(result);
      })
      .catch(function (error) {
          console.error(error);
      });
}


/////////////////////////////////////////////////////////////////////////////////////

function GetErrorData(context)
{
    // register a command that is invoked when the status bar
    // item is clicked.
    const myCommandId = 'codehealer.getErrorData';
    context.subscriptions.push(vscode.commands.registerCommand(myCommandId, async () => 
    {
        // const pageType = await vscode.window.showQuickPick(
        //     ['shell', 'fetch rows, list in table'],
        //     { placeHolder: 'select type of web page to make' });
        vscode.commands.executeCommand("extension.terminalCapture.runCapture")
    }));

    // create a new status bar item that we can now manage
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    item.command = myCommandId;

    context.subscriptions.push(item);

    item.text = `GetErrorData`;
    item.tooltip = `Error Data tool tip`;
    item.show();
}
function SuggestionGenerator(context, pairs){
    const suggestionId = 'healerSuggestion.suggest';
    context.subscriptions.push(
        vscode.commands.registerCommand(suggestionId, () => {
          // Create and show panel
          const panel = vscode.window.createWebviewPanel(
            'healerSuggestions',
            'Suggestion',
            vscode.ViewColumn.One,
            {}
          );
          // And set its HTML content
          panel.webview.html = generateHtmlCode(pairs);
        })
      );
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    item.command = suggestionId;

    context.subscriptions.push(item);

    item.text = `ShowSuggestion`;
    item.tooltip = `show suggestion tooltip`;
    item.show();
}
function AnalyzeErrorData(context){

    const getActiveEditorDataId = 'codehealer.analyzeErrorData';
    context.subscriptions.push(vscode.commands.registerCommand(getActiveEditorDataId, async () => 
    {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const text = document.getText();
        console.log(text);
        vscode.commands.executeCommand("workbench.action.revertAndCloseActiveEditor");
        return text;
    }
    else{
        vscode.window.showInformationMessage('No active editor found');
    }
    }));

    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    item.command = getActiveEditorDataId;

    context.subscriptions.push(item);

    let fileContents = getSourceCode(extractFilePaths(errorMessages));

    const prompt = Object.values(prompts).join('') + errorMessages.join('\n') + fileContents.join('\n');
    OpenAI(prompt);

    item.text = `AnalyzeErrrorData`;
    item.tooltip = `Analyze Error Data tool tip`;
    item.show();
}

let pairs = [
    {old_line: "This is the old line 1", new_line: "This is the new line 1"},
    {old_line: "This is the old line 2", new_line: "This is the new line 2"},
    {old_line: "This is the old line 3", new_line: "This is the new line 3"},
    {old_line: "This is the old line 4", new_line: "This is the new line 4"},
  ];
  function generateHtmlCode(pairs) {
    let htmlCode = `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        .line-pair {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .old-line {
          color: #B22222;
          background-color: #FFE6E6;
          padding: 10px;
          border-radius: 5px;
          width: 45%;
        }
        .new-line {
          color: #008000;
          background-color: #E6FFE6;
          padding: 10px;
          border-radius: 5px;
          width: 45%;
        }
      </style>
    </head>
    <body>
    `;
    pairs.forEach(pair => {
      htmlCode += `
      <div class="line-pair">
        <p class="old-line">${pair.old_line}</p>
        <p class="new-line">${pair.new_line}</p>
      </div>
      `;
    });
    htmlCode += `
    </body>
    </html>
    `;
    return htmlCode;
  }


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
