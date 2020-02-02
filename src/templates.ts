import { template } from 'lodash';

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

export const sectionContent = template('<section><%= html %><hr></section>');

export const inputPrompt = template(
  '<p class="input-prompt"><%- command %></p>'
);

export const fragmentError =
  '<p>Sorry, there was a problem, please try again later.</p>';

export const commandNotFound = template(
  '<p class="tight-top">Command not found: <%- command %></p>'
);

export function reasonContent({
  reasonNumber,
  fragmentHtml,
}: {
  reasonNumber: number;
  fragmentHtml: string;
}): string {
  // Inject the reason number into the returned HTML
  const reasonHtml = fragmentHtml
    .trim()
    .replace('<h2>', `<h2>${reasonNumber}. `);

  return sectionContent({ html: reasonHtml });
}
