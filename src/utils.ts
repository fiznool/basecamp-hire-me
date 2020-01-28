import shuffle from 'lodash/shuffle';

export function createReasonIdCache(total: number): string[] {
  const cache = Array(total)
    .fill(null)
    .map((_, i) => {
      const id = `${i + 1}`;
      const idPadded = id.padStart(2, '0');
      return idPadded;
    });

  return shuffle(cache);
}

export function fetchFragment(route: string): Promise<string> {
  const fragmentPath = `fragments/${route}.html`;
  return fetch(fragmentPath)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Could not fetch ${fragmentPath}: ${res.statusText}`);
      }
      return res;
    })
    .then(res => res.text());
}

export function htmlToNode(html: string): Node {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

export function appendHtml<T extends HTMLElement = HTMLElement>(
  target: T,
  html: string
): T {
  const node = htmlToNode(html);
  target.appendChild(node);
  return target;
}
