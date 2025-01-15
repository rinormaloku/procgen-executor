import * as vscode from 'vscode';
import { CommandCodeLensProvider } from './commandCodeLensProvider';

export function activate(context: vscode.ExtensionContext) {
	let terminal: vscode.Terminal | undefined = undefined;

	context.subscriptions.push(
		vscode.commands.registerCommand('markdown.run.command', (args) => {
			if (!terminal || terminal.processId !== undefined) {
				// If the terminal is closed (exitStatus is defined), or doesn't exist, create a new one
				terminal = vscode.window.terminals[0] || vscode.window.createTerminal();
			}

			terminal.show();
			terminal.sendText(args.command);
		})
	);

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider({ language: 'markdown', scheme: 'file' },
			new CommandCodeLensProvider())
	);

	// Clean up the terminal when the extension is deactivated or the terminal is closed
	context.subscriptions.push(
		vscode.window.onDidCloseTerminal(closedTerminal => {
			if (closedTerminal === terminal) {
				terminal = undefined;
			}
		})
	);
}

export function deactivate() { }