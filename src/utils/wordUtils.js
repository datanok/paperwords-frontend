const cache = new Map();

export const isValidWord = async (word, expectedLength) => {
  if (!word || typeof word !== 'string') return false;
  if (word.length !== expectedLength) return false;
  if (!/^[a-zA-Z]+$/.test(word)) return false;

  const key = word.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${key}`);
    const valid = res.ok;
    cache.set(key, valid);
    return valid;
  } catch {
    // Network failure — fail open so players aren't blocked
    return true;
  }
};

export const checkLetterMatch = (guessedLetter, secretWord) => {
  const letter = guessedLetter.toUpperCase();
  const positions = [];

  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i].toUpperCase() === letter) {
      positions.push(i);
    }
  }

  return {
    letter,
    found: positions.length > 0,
    positions,
    count: positions.length,
  };
};

export const updateWordDisplay = (wordDisplay, guessedLetter, positions) => {
  const display = wordDisplay.split('');
  positions.forEach((pos) => {
    display[pos] = guessedLetter.toUpperCase();
  });
  return display.join('');
};

export const createInitialWordDisplay = (wordLength) => {
  return Array(wordLength).fill('_').join('');
};

export const isWordComplete = (wordDisplay) => {
  return !wordDisplay.includes('_');
};

export const checkWin = (wordDisplay, secretWord) => {
  return wordDisplay.replace(/\s/g, '') === secretWord.toUpperCase();
};
