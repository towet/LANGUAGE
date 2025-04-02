import React, { useState, useRef, useEffect } from 'react';
import { Languages, Send, Menu, X, ArrowRight, Eye, EyeOff, Globe, Laptop, Settings, Zap, Smartphone, ShoppingCart } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { getGeminiResponse } from './lib/gemini';
import { addKnowledgeEntry } from './lib/knowledgeBase';
import { KnowledgeEntry } from './data/knowledgeBase';
import heroImage from './assets/hero.jpg';
import heroTwo from './assets/hero2.jpg';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  category?: 'products' | 'support' | 'warranty' | 'installation' | 'general';
  isTyping?: boolean;
}

type AuthMode = 'none' | 'login' | 'signup';
type Language = 'English' | 'French' | 'Kiswahili';

interface EnrichKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { username: string } | null;
}

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onClose: () => void;
  currentUser: { username: string } | null;
  selectedLanguage: Language | null;
}

interface AuthModalProps {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setCurrentUser: (user: { username: string } | null) => void;
  onClose: () => void;
}

interface LanguageSelectorProps {
  onSelect: (language: Language) => void;
  onClose: () => void;
}

interface LanguageLearningPageProps {
  currentUser: { username: string } | null;
  selectedLanguage: Language | null;
  learningProgress: {
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    xp: number;
    completedLessons: number;
    streak: number;
  };
  onClose: () => void;
}

const learningModules: {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  xpReward: number;
  content: {
    theory: string;
    video?: string;
    quiz: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
    practice: string;
  };
}[] = [
  {
    id: 'english-basics',
    title: 'English Essentials',
    description: 'Master English fundamentals with interactive lessons',
    icon: <Languages className="h-6 w-6 animate-bounce-gentle text-blue-500" />,
    progress: 0,
    difficulty: 'Beginner',
    duration: '4 weeks',
    xpReward: 100,
    content: {
      theory: `# English Language Fundamentals
      
      ## Basic Grammar Rules
      - Subject + Verb + Object structure
      - Present, Past, and Future tenses
      - Articles (a, an, the)
      
      ## Common Phrases
      - Greetings and introductions
      - Everyday conversations
      - Asking for directions
      
      ## Pronunciation Guide
      - Vowel sounds
      - Consonant clusters
      - Word stress patterns`,
      video: 'https://example.com/english-basics',
      quiz: [
        {
          question: 'Which sentence is grammatically correct?',
          options: [
            'I am going to the store',
            'I going to the store',
            'I to going the store',
            'Me go store'
          ],
          correctAnswer: 0
        },
        {
          question: 'What is the past tense of "eat"?',
          options: ['eat', 'ate', 'eaten', 'eated'],
          correctAnswer: 1
        }
      ],
      practice: 'Practice basic conversations with our AI tutor!'
    }
  },
  {
    id: 'french-starter',
    title: 'French Foundations',
    description: 'Begin your journey into French language and culture',
    icon: <Globe className="h-6 w-6 animate-pulse-soft text-red-500" />,
    progress: 0,
    difficulty: 'Beginner',
    duration: '4 weeks',
    xpReward: 100,
    content: {
      theory: `# French Language Basics
      
      ## Essential Grammar
      - Le, la, les (articles)
      - Regular -er, -ir, -re verbs
      - Basic conjugations
      
      ## Key Phrases
      - Bonjour, Au revoir
      - S'il vous plaît, Merci
      - Comment allez-vous?
      
      ## Pronunciation
      - Nasal sounds
      - Silent letters
      - Liaisons`,
      video: 'https://example.com/french-basics',
      quiz: [
        {
          question: 'What is the correct article for "table" in French?',
          options: ['le', 'la', 'les', 'l\''],
          correctAnswer: 1
        },
        {
          question: 'How do you say "Hello" in French?',
          options: ['Au revoir', 'Bonjour', 'Merci', 'S\'il vous plaît'],
          correctAnswer: 1
        }
      ],
      practice: 'Practice French pronunciation and basic conversations!'
    }
  },
  {
    id: 'swahili-intro',
    title: 'Swahili Beginnings',
    description: 'Discover the beauty of Swahili language and East African culture',
    icon: <Languages className="h-6 w-6 animate-wave text-green-500" />,
    progress: 0,
    difficulty: 'Beginner',
    duration: '4 weeks',
    xpReward: 100,
    content: {
      theory: `# Swahili Language Fundamentals
      
      ## Basic Grammar
      - Noun classes
      - Present tense
      - Subject prefixes
      
      ## Essential Phrases
      - Jambo (Hello)
      - Habari (How are you?)
      - Asante (Thank you)
      
      ## Pronunciation Guide
      - Vowel sounds
      - Consonant combinations
      - Stress patterns`,
      video: 'https://example.com/swahili-basics',
      quiz: [
        {
          question: 'What does "Jambo" mean?',
          options: ['Goodbye', 'Hello', 'Thank you', 'Please'],
          correctAnswer: 1
        },
        {
          question: 'How do you say "Thank you" in Swahili?',
          options: ['Jambo', 'Habari', 'Asante', 'Karibu'],
          correctAnswer: 2
        }
      ],
      practice: 'Practice Swahili greetings and basic conversations!'
    }
  }
];

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes wave {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
    100% { transform: rotate(0deg); }
  }
  
  .animate-bounce-gentle {
    animation: bounce-gentle 2s infinite;
  }
  
  .animate-pulse-soft {
    animation: pulse-soft 2s infinite;
  }
  
  .animate-wave {
    animation: wave 2s infinite;
  }
`;
document.head.appendChild(styleSheet);

const EnrichKnowledgeModal: React.FC<EnrichKnowledgeModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<KnowledgeEntry['category']>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passKey, setPassKey] = useState('');
  const [isPassKeyValid, setIsPassKeyValid] = useState(false);

  const handlePassKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passKey === '2222') {
      setIsPassKeyValid(true);
    } else {
      toast.error('Invalid pass key');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addKnowledgeEntry({
        topic: topic.trim(),
        content: content.trim(),
        category,
        created_by: currentUser?.username || 'anonymous'
      });

      toast.success('Knowledge base enriched successfully!');
      onClose();
      // Reset form
      setTopic('');
      setContent('');
      setCategory('general');
      setPassKey('');
      setIsPassKeyValid(false);
    } catch (error: any) {
      console.error('Error enriching knowledge base:', error);
      toast.error('Failed to enrich knowledge base. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Enrich Knowledge Base
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isPassKeyValid ? (
            // Pass Key Form
            <form onSubmit={handlePassKeySubmit} className="space-y-4">
              <div>
                <label htmlFor="passKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Pass Key
                </label>
                <input
                  type="password"
                  id="passKey"
                  value={passKey}
                  onChange={(e) => setPassKey(e.target.value)}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter pass key to add knowledge"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Verify Pass Key
              </button>
            </form>
          ) : (
            // Knowledge Entry Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Topic field */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter topic"
                  required
                />
              </div>

              {/* Category field */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as KnowledgeEntry['category'])}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="products">Products</option>
                  <option value="support">Support</option>
                  <option value="warranty">Warranty</option>
                  <option value="installation">Installation</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Content field */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter detailed information"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  'Add to Knowledge Base'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AuthModal: React.FC<AuthModalProps> = ({
  authMode,
  setAuthMode,
  setIsAuthenticated,
  setCurrentUser,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState({
    username: '',
    password: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submission handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.username || !formState.password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      setCurrentUser({
        username: formState.username
      });
      toast.success('Successfully logged in!');
      setAuthMode('none');
    } catch (error) {
      toast.error('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.username || !formState.password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      setCurrentUser({
        username: formState.username
      });
      toast.success('Account created successfully!');
      setAuthMode('none');
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {authMode === 'login' ? 'Welcome back!' : 'Create account'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formState.username}
                onChange={handleChange}
                className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formState.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 pr-10 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                authMode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>

            {/* Toggle auth mode */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, onClose }) => {
  const languages: Array<{
    code: Language,
    name: string,
    nativeName: string,
    description: string,
    icon: string,
    image: string,
    benefits: string[]
  }> = [
    {
      code: 'English',
      name: 'English',
      nativeName: 'English',
      description: 'Master the global language of business and technology',
      icon: '🇬🇧',
      image: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=500&auto=format',
      benefits: [
        'Access to global business opportunities',
        'Enhance your tech career prospects',
        'Connect with 1.5B+ speakers worldwide'
      ]
    },
    {
      code: 'French',
      name: 'French',
      nativeName: 'Français',
      description: 'Discover the language of culture and diplomacy',
      icon: '🇫🇷',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format',
      benefits: [
        'Immerse in rich cultural heritage',
        'Open doors to diplomatic careers',
        'Join 300M+ French speakers globally'
      ]
    },
    {
      code: 'Kiswahili',
      name: 'Swahili',
      nativeName: 'Kiswahili',
      description: 'Learn the lingua franca of East Africa',
      icon: '🇰🇪',
      image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=500&auto=format',
      benefits: [
        'Connect across East Africa',
        'Access emerging markets',
        'Experience rich African culture'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl transform transition-all duration-500 animate-slideUp">
        {/* Header Section */}
        <div className="text-center p-8 pb-0 space-y-4">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-transparent bg-clip-text animate-gradient">
            Start Your Language Journey
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose your preferred language and embark on an interactive learning experience with our AI-powered chat assistant
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          {languages.map((lang, index) => (
            <div
              key={lang.code}
              className="group flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 animate-slideIn overflow-hidden"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={lang.image} 
                  alt={lang.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 group-hover:from-black/60 transition-all duration-500" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <span className="text-3xl">{lang.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {lang.nativeName}
                    </h3>
                    <p className="text-sm text-gray-200">{lang.name}</p>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 flex flex-col">
                <p className="text-gray-600 mb-4 flex-grow">
                  {lang.description}
                </p>
                
                {/* Benefits */}
                <ul className="space-y-2 mb-6">
                  {lang.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => {
                    onSelect(lang.code);
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02]"
                >
                  <span>Start Learning {lang.name}</span>
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

const LanguageLearningPage: React.FC<LanguageLearningPageProps> = ({
  currentUser,
  selectedLanguage,
  learningProgress,
  onClose
}) => {
  const [activeModule, setActiveModule] = useState<string>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = `You are an AI language tutor helping someone learn ${selectedLanguage}. 
        Current level: ${learningProgress.level}. 
        Focus on making responses educational and include examples when possible.
        If the user asks for translations, provide them along with pronunciation guides.
        Occasionally quiz the user to reinforce learning.`;

      const response = await getGeminiResponse(inputMessage + '\n\nContext: ' + context);

      const aiMessage: Message = {
        id: messages.length + 2,
        content: response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={onClose} className="mr-4 text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  {currentUser?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-900">{currentUser?.username}</h2>
                  <p className="text-xs text-gray-500">Beginner</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span>XP Points: {learningProgress.xp}</span>
                <span className="mx-2">•</span>
                <span>Day Streak: {learningProgress.streak}🔥</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Language Tutor
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Learning {selectedLanguage}
                  </p>
                </div>
                <div className="border-t border-gray-100">
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-4">LEARNING MODULES</h4>
                    <div className="space-y-2">
                      {learningModules.map(module => (
                        <button
                          key={module.id}
                          onClick={() => setActiveModule(module.id)}
                          className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                            activeModule === module.id
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            activeModule === module.id
                              ? 'bg-emerald-100'
                              : 'bg-gray-100'
                          }`}>
                            {module.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-medium text-sm">{module.title}</h3>
                            <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${module.progress}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeModule === 'chat' ? 'Chat with AI Tutor' : learningModules.find(m => m.id === activeModule)?.title}
                </h3>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-100" />
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder={`Type in ${selectedLanguage} or English...`}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('none');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
  } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showEnrichKnowledge, setShowEnrichKnowledge] = useState(false);
  const [learningProgress, setLearningProgress] = useState({
    level: 'Beginner' as const,
    xp: 0,
    completedLessons: 0,
    streak: 0
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast.success('Successfully logged out!');
  };

  const handleStartChat = () => {
    if (isAuthenticated) {
      setShowLanguageSelector(true);
    } else {
      setAuthMode('login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Toaster position="top-center" />
      
      <nav className="bg-white/70 backdrop-blur-lg sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-transparent bg-clip-text">
                Smart Gadgets
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition">Features</a>
              <a href="#about" className="text-gray-600 hover:text-emerald-600 transition">About</a>
              <button
                onClick={handleStartChat}
                className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-white px-6 py-2 rounded-xl hover:opacity-90 transition duration-300 shadow-lg hover:shadow-xl"
              >
                Start Chat
              </button>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Welcome, {currentUser?.username}!</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-emerald-600 transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-white px-6 py-2 rounded-xl hover:opacity-90 transition duration-300"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white/90 backdrop-blur-lg border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-600">Features</a>
              <a href="#about" className="block px-3 py-2 text-gray-600">About</a>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowLanguageSelector(true);
                  } else {
                    setAuthMode('signup');
                  }
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-emerald-600"
              >
                Start Chat
              </button>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-gray-600"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-emerald-600"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-emerald-600"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {showLanguageSelector && (
        <LanguageSelector
          onSelect={(language) => {
            setSelectedLanguage(language);
            setShowLanguageSelector(false);
            setShowChat(true);
          }}
          onClose={() => setShowLanguageSelector(false)}
        />
      )}

      {showChat && (
        <LanguageLearningPage 
          currentUser={currentUser}
          selectedLanguage={selectedLanguage}
          learningProgress={learningProgress}
          onClose={() => {
            setShowChat(false);
            setSelectedLanguage(null);
          }}
        />
      )}
      {authMode !== 'none' && (
        <AuthModal 
          authMode={authMode} 
          setAuthMode={setAuthMode}
          setIsAuthenticated={setIsAuthenticated}
          setCurrentUser={setCurrentUser}
          onClose={() => setAuthMode('none')}
        />
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <div className="flex-1 space-y-6 text-center md:text-left w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-transparent bg-clip-text">
                Welcome to
              </span>
              <br />
              Smart Gadgets
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your one-stop destination for the latest electronics and expert tech support.
            </p>
            <div className="flex justify-center md:justify-start">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowLanguageSelector(true);
                  } else {
                    setAuthMode('signup');
                  }
                }}
                className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-white px-8 py-3 rounded-xl hover:opacity-90 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full md:w-auto"
              >
                Start Chat
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Image Container */}
          <div className="flex-1 relative w-full">
            <div className="relative w-full h-[450px] md:h-[500px] lg:h-[600px]">
              <img
                src={heroImage}
                alt="Electronics store"
                className="w-full h-full object-cover rounded-2xl shadow-2xl transform hover:scale-[1.02] transition duration-500"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-600/20 via-transparent to-transparent"></div>
            </div>
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Laptop className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="font-bold text-emerald-600">98%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-transparent bg-clip-text">
            Why Choose Smart Gadgets?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-br from-teal-500 to-green-500 bg-clip-text text-transparent mb-6">
                Get Expert Advice Today
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get personalized guidance for your electronics needs with our advanced AI chatbot.
              </p>
              <a
                href="#chat"
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200"
              >
                Start Chatting
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
            <div className="relative">
              <img
                src={heroTwo}
                alt="Electronics store advisor"
                className="w-full h-auto rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl"></div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-transparent bg-clip-text">
            Why Choose Smart Gadgets?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-white/20">
              <ShoppingCart className="h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Product Guidance</h3>
              <p className="text-gray-600">Get personalized product recommendations based on your needs and preferences.</p>
            </div>
            <div className="p-8 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-white/20">
              <Settings className="h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Technical Support</h3>
              <p className="text-gray-600">Get expert technical support for your electronics products.</p>
            </div>
            <div className="p-8 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-white/20">
              <Zap className="h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Warranty and Installation</h3>
              <p className="text-gray-600">Get information on warranty and installation services for your electronics products.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;