const vscode = require('vscode');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	createStatusBarItem(context);

	console.log('Congratulations, your extension "codehealer" is now active!');
	let disposable = vscode.commands.registerCommand('codehealer.heal', function () {
		vscode.window.showInformationMessage('Hello World from codehealer!');
	});

	context.subscriptions.push(disposable);
}

function createStatusBarItem(context)
{
    // register a command that is invoked when the status bar
    // item is clicked.
    const myCommandId = 'myExtension.statusBarClick';
    context.subscriptions.push(vscode.commands.registerCommand(myCommandId, async () => 
    {
        const pageType = await vscode.window.showQuickPick(
            ['shell', 'fetch rows, list in table'],
            { placeHolder: 'select type of web page to make' });

    }));

    // create a new status bar item that we can now manage
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    item.command = myCommandId;

    context.subscriptions.push(item);

    item.text = `CodeHealer`;
    item.tooltip = `status bar item tooltip`;
    item.show();
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
