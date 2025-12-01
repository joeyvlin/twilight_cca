import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useThemeClasses } from '../hooks/useThemeClasses';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

export function FAQ() {
  const themeClasses = useThemeClasses();
  const [faqData, setFaqData] = useState<FAQSection[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFAQ = async () => {
      try {
        const response = await fetch('/FAQ.txt');
        const text = await response.text();
        const parsed = parseFAQ(text);
        setFaqData(parsed);
        setLoading(false);
      } catch (error) {
        console.error('Error loading FAQ:', error);
        setLoading(false);
      }
    };

    loadFAQ();
  }, []);

  const parseFAQ = (text: string): FAQSection[] => {
    const sections: FAQSection[] = [];
    const lines = text.split('\n');
    
    let currentSection: FAQSection | null = null;
    let currentQuestion: string | null = null;
    let currentAnswer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines, but save Q&A if we have one
      if (!line) {
        if (currentQuestion && currentAnswer.length > 0 && currentSection) {
          currentSection.items.push({
            question: currentQuestion,
            answer: currentAnswer.join(' ').trim()
          });
          currentQuestion = null;
          currentAnswer = [];
        }
        continue;
      }

      // Check if it's a section title with <FAQ> tag
      if (line.startsWith('<FAQ>')) {
        // Save previous section if exists
        if (currentSection && currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        
        // Save any pending Q&A before starting new section
        if (currentQuestion && currentAnswer.length > 0) {
          if (!currentSection) {
            currentSection = { title: 'General', items: [] };
          }
          currentSection.items.push({
            question: currentQuestion,
            answer: currentAnswer.join(' ').trim()
          });
          currentQuestion = null;
          currentAnswer = [];
        }
        
        // Extract section title (remove <FAQ> tag)
        const sectionTitle = line.replace(/^<FAQ>\s*/, '').trim();
        
        // Start new section
        currentSection = {
          title: sectionTitle,
          items: []
        };
        continue;
      }

      // Check if it's a question (ends with ?)
      if (line.endsWith('?')) {
        // Save previous Q&A if exists
        if (currentQuestion && currentAnswer.length > 0 && currentSection) {
          currentSection.items.push({
            question: currentQuestion,
            answer: currentAnswer.join(' ').trim()
          });
        }
        
        currentQuestion = line;
        currentAnswer = [];
        continue;
      }

      // It's part of an answer
      if (currentQuestion) {
        currentAnswer.push(line);
      } else if (!currentSection) {
        // If we don't have a section yet, create a default one
        currentSection = {
          title: 'General',
          items: []
        };
      }
    }

    // Save last Q&A and section
    if (currentQuestion && currentAnswer.length > 0 && currentSection) {
      currentSection.items.push({
        question: currentQuestion,
        answer: currentAnswer.join(' ').trim()
      });
    }

    if (currentSection && currentSection.items.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  };

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const renderAnswer = (answer: string) => {
    // Pattern to match ordered list items: (1), (2), etc. or 1., 2., etc.
    // Find all positions where list items start
    const parenPattern = /\((\d+)\)/g;
    const numberedPattern = /\b(\d+)\.\s/g;
    
    // Try parentheses format first: (1), (2), etc.
    const parenMatches = Array.from(answer.matchAll(parenPattern));
    
    if (parenMatches.length >= 2) {
      // We have a list - split the answer into parts
      const parts: (string | { type: 'list'; items: string[] })[] = [];
      const listItems: string[] = [];
      
      // Get text before the first list item
      const firstIndex = parenMatches[0].index || 0;
      const textBefore = answer.substring(0, firstIndex).trim();
      
      // Extract text between each list item marker
      for (let i = 0; i < parenMatches.length; i++) {
        const match = parenMatches[i];
        const startIndex = (match.index || 0) + match[0].length;
        const endIndex = i < parenMatches.length - 1 
          ? (parenMatches[i + 1].index || answer.length)
          : answer.length;
        
        const itemText = answer.substring(startIndex, endIndex).trim();
        if (itemText) {
          listItems.push(itemText);
        }
      }
      
      // Get text after the last list item
      const lastMatch = parenMatches[parenMatches.length - 1];
      const lastIndex = (lastMatch.index || 0) + lastMatch[0].length;
      const textAfter = answer.substring(lastIndex).trim();
      
      // Build parts array
      if (textBefore) {
        parts.push(textBefore);
      }
      if (listItems.length > 0) {
        parts.push({ type: 'list', items: listItems });
      }
      if (textAfter) {
        parts.push(textAfter);
      }
      
      // Render
      return (
        <div>
          {parts.map((part, index) => {
            if (typeof part === 'string') {
              return <p key={index} className={index > 0 ? 'mt-4' : ''}>{part}</p>;
            } else {
              return (
                <ol key={index} className="list-decimal list-inside mt-4 space-y-2 ml-4">
                  {part.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="ml-2">{item}</li>
                  ))}
                </ol>
              );
            }
          })}
        </div>
      );
    }
    
    // Try numbered format: 1., 2., etc.
    const numberedMatches = Array.from(answer.matchAll(numberedPattern));
    if (numberedMatches.length >= 2) {
      const parts: (string | { type: 'list'; items: string[] })[] = [];
      const listItems: string[] = [];
      
      const firstIndex = numberedMatches[0].index || 0;
      const textBefore = answer.substring(0, firstIndex).trim();
      
      for (let i = 0; i < numberedMatches.length; i++) {
        const match = numberedMatches[i];
        const startIndex = (match.index || 0) + match[0].length;
        const endIndex = i < numberedMatches.length - 1 
          ? (numberedMatches[i + 1].index || answer.length)
          : answer.length;
        
        const itemText = answer.substring(startIndex, endIndex).trim();
        if (itemText) {
          listItems.push(itemText);
        }
      }
      
      const lastMatch = numberedMatches[numberedMatches.length - 1];
      const lastIndex = (lastMatch.index || 0) + lastMatch[0].length;
      const textAfter = answer.substring(lastIndex).trim();
      
      if (textBefore) {
        parts.push(textBefore);
      }
      if (listItems.length > 0) {
        parts.push({ type: 'list', items: listItems });
      }
      if (textAfter) {
        parts.push(textAfter);
      }
      
      return (
        <div>
          {parts.map((part, index) => {
            if (typeof part === 'string') {
              return <p key={index} className={index > 0 ? 'mt-4' : ''}>{part}</p>;
            } else {
              return (
                <ol key={index} className="list-decimal list-inside mt-4 space-y-2 ml-4">
                  {part.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="ml-2">{item}</li>
                  ))}
                </ol>
              );
            }
          })}
        </div>
      );
    }
    
    // No list detected, render as plain text
    return <p>{answer}</p>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading FAQ...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 sm:mb-12 text-center">
        Frequently Asked Questions
      </h1>

      <div className="space-y-8">
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-12">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${themeClasses.textAccent}`}>
              {section.title}
            </h2>
            
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => {
                const key = `${sectionIndex}-${itemIndex}`;
                const isExpanded = expandedItems.has(key);

                return (
                  <div
                    key={itemIndex}
                    className="border border-gray-700 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800"
                  >
                    <button
                      onClick={() => toggleItem(sectionIndex, itemIndex)}
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-base sm:text-lg font-semibold pr-4">
                        {item.question}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className={`w-5 h-5 flex-shrink-0 ${themeClasses.textAccent}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 flex-shrink-0 ${themeClasses.textAccent}`} />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-0">
                        <div className="text-sm sm:text-base text-gray-300 leading-relaxed">
                          {renderAnswer(item.answer)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

