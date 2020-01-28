import shuffle from 'lodash/shuffle';

interface Cache {
  next: () => string | undefined;
  remaining: () => number;
  isEmpty: () => boolean;
}

export function createReasonIdCache(total: number): Cache {
  const cacheArray = generateCache(total);

  return {
    next(): string | undefined {
      return cacheArray.pop();
    },
    remaining(): number {
      return cacheArray.length;
    },
    isEmpty(): boolean {
      return cacheArray.length === 0;
    },
  };
}

function generateCache(total: number): string[] {
  const cache = Array(total)
    .fill(null)
    .map((_, i) => {
      const id = `${i + 1}`;
      const idPadded = id.padStart(2, '0');
      return idPadded;
    });

  return shuffle(cache);
}
