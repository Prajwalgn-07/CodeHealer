const vscode = require('vscode');


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
