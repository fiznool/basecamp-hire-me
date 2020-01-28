export function promptHelp(hasRemainingReasons: boolean): string {
  return hasRemainingReasons
    ? `Type <kbd>more</kbd> (<kbd>m</kbd>) for another reason, or <kbd>restart</kbd> (<kbd>r</kbd>) to start again`
    : `Type <kbd>restart</kbd> (<kbd>r</kbd>) to start again`;
}

export function reasonContent(
  reasonNumber: number,
  fragmentHtml: string
): string {
  // Inject the reason number into the returned HTML
  const reasonContent = fragmentHtml
    .trim()
    .replace('<h2>', `<h2>${reasonNumber}. `);

  // Return the content succeeded by a horizontal rule
  return `${reasonContent}<hr>`;
}
