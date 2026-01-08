import { seedFromString, SeededRNG } from './seed';

export interface Quote {
  text: string;
  author: string;
}

const CACHED_QUOTE_KEY = 'axiomata-cached-quote';
const LAST_QUOTE_INDEX_KEY = 'axiomata-last-quote-index';
const SEEN_QUOTES_KEY = 'axiomata-seen-quotes';

const QUOTES: Quote[] = [
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "The person who says it cannot be done should not interrupt the person who is doing it.", author: "Chinese Proverb" },
  { text: "I can't change the direction of the wind, but I can adjust my sails to always reach my destination.", author: "Jimmy Dean" },
  { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr." },
  { text: "Life itself is the proper binge.", author: "Julia Child" },
  { text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.", author: "Mark Twain" },
  { text: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Rob Siltanen" },
  { text: "To live is the rarest thing in the world. Most people just exist.", author: "Oscar Wilde" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "If you can dream it, you can do it.", author: "Walt Disney" },
  { text: "The way out is through.", author: "Robert Frost" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "If you are working on something exciting that you really care about, you don't have to be pushed. The vision pulls you.", author: "Steve Jobs" },
  { text: "People often say that motivation doesn't last. Well, neither does bathing—that's why we recommend it daily.", author: "Zig Ziglar" },
  { text: "There are two types of people who will tell you that you cannot make a difference in this world: those who are afraid to try and those who are afraid you will succeed.", author: "Ray Goforth" },
  { text: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Go confidently in the direction of your dreams! Live the life you've imagined.", author: "Henry David Thoreau" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "Your limitation—it's only your imagination.", author: "Anonymous" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Dream it. Wish it. Do it.", author: "Anonymous" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Anonymous" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
  { text: "Dream bigger. Do bigger.", author: "Anonymous" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Anonymous" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big things happen.", author: "John Wooden" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Anonymous" },
  { text: "Don't wait for opportunity. Create it.", author: "Anonymous" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Anonymous" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Anonymous" },
  { text: "Dream it. Believe it. Build it.", author: "Anonymous" },
];

interface CachedQuote {
  dailyKey: string;
  quote: Quote;
  quoteIndex: number;
}

function getCachedQuote(dailyKey: string): Quote | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CACHED_QUOTE_KEY);
    if (stored) {
      const cached: CachedQuote = JSON.parse(stored);
      if (cached.dailyKey === dailyKey) {
        return cached.quote;
      }
    }
  } catch (error) {
    console.error('Failed to load cached quote:', error);
  }
  return null;
}

function setCachedQuote(dailyKey: string, quote: Quote, quoteIndex: number): void {
  if (typeof window === 'undefined') return;
  try {
    const cached: CachedQuote = {
      dailyKey,
      quote,
      quoteIndex,
    };
    localStorage.setItem(CACHED_QUOTE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Failed to cache quote:', error);
  }
}

function getLastQuoteIndex(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(LAST_QUOTE_INDEX_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch (error) {
    console.error('Failed to load last quote index:', error);
  }
  return null;
}

function setLastQuoteIndex(quoteIndex: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_QUOTE_INDEX_KEY, quoteIndex.toString());
  } catch (error) {
    console.error('Failed to save last quote index:', error);
  }
}

function getSeenQuoteIndices(): Set<number> {
  if (typeof window === 'undefined') {
    return new Set();
  }
  try {
    const stored = localStorage.getItem(SEEN_QUOTES_KEY);
    if (stored) {
      const indices = JSON.parse(stored) as number[];
      return new Set(indices);
    }
  } catch (error) {
    console.error('Failed to load seen quotes:', error);
  }
  return new Set();
}

function markQuoteAsSeen(quoteIndex: number): void {
  if (typeof window === 'undefined') return;
  try {
    const seen = getSeenQuoteIndices();
    seen.add(quoteIndex);
    localStorage.setItem(SEEN_QUOTES_KEY, JSON.stringify(Array.from(seen)));
  } catch (error) {
    console.error('Failed to save seen quote:', error);
  }
}

function resetSeenQuotes(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SEEN_QUOTES_KEY);
  } catch (error) {
    console.error('Failed to reset seen quotes:', error);
  }
}

export function getQuoteOfTheDay(dailyKey: string): Quote {
  // Check if we have a cached quote for this daily key
  const cachedQuote = getCachedQuote(dailyKey);
  if (cachedQuote) {
    return cachedQuote;
  }

  // Generate a new quote for this day
  const seed = seedFromString(dailyKey);
  const rng = new SeededRNG(seed);
  const lastQuoteIndex = getLastQuoteIndex();
  const seenIndices = getSeenQuoteIndices();
  
  // Filter out seen quotes and the last quote shown (to avoid consecutive repeats)
  const availableQuotes = QUOTES.map((quote, index) => ({ quote, index }))
    .filter(({ index }) => {
      if (seenIndices.has(index)) return false;
      if (lastQuoteIndex !== null && index === lastQuoteIndex) return false;
      return true;
    });
  
  let selected: { quote: Quote; index: number };
  
  if (availableQuotes.length === 0) {
    // If no available quotes (all seen or only last quote remains), reset and allow repeats
    resetSeenQuotes();
    const allQuotes = QUOTES.map((quote, index) => ({ quote, index }));
    // Still exclude the last quote to avoid consecutive repeats
    const filtered = lastQuoteIndex !== null 
      ? allQuotes.filter(({ index }) => index !== lastQuoteIndex)
      : allQuotes;
    
    if (filtered.length === 0) {
      // If only one quote exists and it was the last one, we have to use it
      selected = allQuotes[0];
    } else {
      selected = rng.choice(filtered);
    }
  } else {
    selected = rng.choice(availableQuotes);
  }
  
  // Cache the quote for this daily key
  setCachedQuote(dailyKey, selected.quote, selected.index);
  
  // Track as last quote shown
  setLastQuoteIndex(selected.index);
  
  // Mark as seen
  markQuoteAsSeen(selected.index);
  
  return selected.quote;
}

