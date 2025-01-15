
import vscode = require('vscode');

export class CommandCodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void>;

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Regex to match command block start lines
        const commandStartRegex = /^(```bash?|<!--)/;

        let inCommand = false;
        let currentCommand = '';
        let commandStartLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (inCommand) {
                if (line === '```' || line === '-->') {
                    const cmd: vscode.Command = {
                        title: 'Run command in terminal',
                        command: 'markdown.run.command',
                        arguments: [{ command: currentCommand }]
                    };

                    // Create new Position objects
                    const startPos = new vscode.Position(commandStartLine, 0);
                    const endPos = new vscode.Position(commandStartLine + 1, 0);
                    const range = new vscode.Range(startPos, endPos);

                    codeLenses.push(new vscode.CodeLens(range, cmd));
                    inCommand = false;
                    currentCommand = '';
                } else {
                    currentCommand += line + '\n';
                }
            } else if (commandStartRegex.test(line)) {
                inCommand = true;
                commandStartLine = i;
            }
        }

        return codeLenses;
    }

    resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        return null;
    }
}