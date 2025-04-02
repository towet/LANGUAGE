import { KnowledgeEntry, initialKnowledgeBase } from '../data/knowledgeBase';

const STORAGE_KEY = 'knowledge_base_entries';

// Load entries from localStorage
const loadStoredEntries = (): KnowledgeEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialKnowledgeBase;
  } catch (error) {
    console.error('Error loading stored entries:', error);
    return initialKnowledgeBase;
  }
};

// Save entries to localStorage
const saveEntries = (entries: KnowledgeEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entries:', error);
  }
};

// Initialize in-memory storage from localStorage
let entries: KnowledgeEntry[] = loadStoredEntries();

export const addKnowledgeEntry = async (entry: KnowledgeEntry) => {
  try {
    const newEntry = {
      ...entry,
      created_at: new Date().toISOString()
    };
    
    entries.push(newEntry);
    saveEntries(entries);
    return newEntry;
  } catch (error) {
    console.error('Error adding knowledge entry:', error);
    throw error;
  }
};

export const getKnowledgeEntries = async (): Promise<KnowledgeEntry[]> => {
  return entries;
};

export const searchKnowledgeBase = (query: string): KnowledgeEntry[] => {
  const normalizedQuery = query.toLowerCase();
  return entries.filter(entry => {
    const normalizedContent = entry.content.toLowerCase();
    const normalizedTopic = entry.topic.toLowerCase();
    return normalizedContent.includes(normalizedQuery) || normalizedTopic.includes(normalizedQuery);
  });
};

export const searchInternet = async (query: string): Promise<string> => {
  console.log('Searching internet for:', query);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "Internet search results would appear here.";
};

export const getKnowledgeByCategory = (category: KnowledgeEntry['category']): KnowledgeEntry[] => {
  return entries.filter(entry => entry.category === category);
};

export const removeKnowledgeEntry = async (topic: string): Promise<void> => {
  entries = entries.filter(entry => entry.topic !== topic);
  saveEntries(entries);
};
