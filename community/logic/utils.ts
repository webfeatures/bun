export function shuffle(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

export function getRandomNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomElements(array: any[]) {
  return shuffle(array).slice(0, getRandomNumberBetween(1, array.length));
}