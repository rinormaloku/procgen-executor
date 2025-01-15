import * as vscode from 'vscode';
import { CommandCodeLensProvider } from './commandCodeLensProvider';

export function activate(context: vscode.ExtensionContext) {
	let terminal: vscode.Terminal | undefined = undefined;

	context.subscriptions.push(
		vscode.commands.registerCommand('markdown.run.command', (args) => {
			// Create or reuse a terminal
			if (!terminal || (terminal.exitStatus && terminal.exitStatus.code !== undefined)) {
				terminal = vscode.window.terminals[0] || vscode.window.createTerminal();
			}

			terminal.show();

			// (1) Send everything as one shot
			terminal.sendText(args.command, false);
			// optionally press "Enter" once after all lines
			terminal.sendText('', true);
		})
	);

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider({ language: 'markdown', scheme: 'file' }, new CommandCodeLensProvider())
	);

	// Clean up the terminal when the extension is deactivated or the terminal is closed
	context.subscriptions.push(
		vscode.window.onDidCloseTerminal((closedTerminal) => {
			if (closedTerminal === terminal) {
				terminal = undefined;
			}
		})
	);
}

export function deactivate() { }
