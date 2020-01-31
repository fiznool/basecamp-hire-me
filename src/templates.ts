export enum PromptHelpType {
  ANOTHER_REASON,
  FINISH,
  RESTART,
}
export const promptHelp = {
  ANOTHER_REASON: `Hit <kbd>Enter</kbd> for another reason`,
  FINISH: `Hit <kbd>Enter</kbd> to finish`,
  RESTART: `Type <kbd>restart</kbd> (<kbd>r</kbd>) to start again, or <kbd>s</kbd> for a sssurprise`,
};

export function reasonContent(
  reasonNumber: number,
  fragmentHtml: string
): string {
  // Inject the reason number into the returned HTML
  const reasonHtml = fragmentHtml
    .trim()
    .replace('<h2>', `<h2>${reasonNumber}. `);

  return sectionContent(reasonHtml);
}

export function sectionContent(html: string): string {
  return `<section>${html}<hr></section>`;
}

export function inputPrompt(command: string): string {
  return `<p class="input-prompt">${command}</p>`;
}

export const fragmentError =
  '<p>Sorry, there was a problem, please try again later.</p>';

export function commandNotFound(command: string): string {
  return `<p class="tight-top">Command not found: ${command}</p>`;
}
