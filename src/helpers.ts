export enum PromptHelpType {
  ANOTHER_REASON,
  FINISH,
  RESTART,
}

export function promptHelp(type: PromptHelpType): string {
  switch (type) {
    case PromptHelpType.ANOTHER_REASON:
      return `Hit <kbd>Enter</kbd> for another reason`;
    case PromptHelpType.FINISH:
      return `Hit <kbd>Enter</kbd> to finish`;
    case PromptHelpType.RESTART:
      return `Type <kbd>restart</kbd> (<kbd>r</kbd>) to start again, or <kbd>s</kbd> for a sssurprise`;
  }
}

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
