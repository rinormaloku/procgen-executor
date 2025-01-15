import vscode = require('vscode');

export class CommandCodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void>;

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Regex to match command block start lines. Adjust if you need more variants (e.g. ```sh, etc.).
        const commandStartRegex = /^(```bash?|<!--)/;

        let inCommand = false;
        let currentCommand = '';
        let commandStartLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]; // do NOT trim so that we preserve indentation and <<EOF blocks

            if (inCommand) {
                // Check if we're at the end of the code block
                if (line.trim() === '```' || line.trim() === '-->') {
                    // Build a CodeLens that will "run" all lines in currentCommand
                    const cmd: vscode.Command = {
                        title: 'Run command in terminal',
                        command: 'markdown.run.command',
                        arguments: [{ command: currentCommand }]
                    };

                    // Create a range at the line where the code block started
                    const startPos = new vscode.Position(commandStartLine, 0);
                    const endPos = new vscode.Position(commandStartLine + 1, 0);
                    const range = new vscode.Range(startPos, endPos);

                    codeLenses.push(new vscode.CodeLens(range, cmd));

                    // Reset flags
                    inCommand = false;
                    currentCommand = '';
                } else {
                    // Still inside the code block, accumulate line as-is
                    currentCommand += line + '\n';
                }
            } else {
                // Not currently inside a command block - check if this line starts one
                if (commandStartRegex.test(line.trim())) {
                    inCommand = true;
                    commandStartLine = i;
                }
            }
        }

        return codeLenses;
    }

    resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        return null;
    }
}
