const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface SearchFilters {
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  keywords?: string[];
}

export async function parseSearchQuery(query: string): Promise<SearchFilters> {
  if (!GEMINI_API_KEY) {
    return extractBasicFilters(query);
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Parse this event search query and extract structured filters. Return ONLY valid JSON with these fields:
- category (string): event category like "tech", "music", "workshop", "meetup", "conference", "sports", "art"
- location (string): city or venue name
- dateFrom (string): ISO date string if date mentioned
- dateTo (string): ISO date string if date range mentioned
- priceMin (number): minimum price if mentioned
- priceMax (number): maximum price if mentioned
- keywords (array of strings): important search terms

Query: "${query}"

Return only the JSON object, no markdown or explanation.`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        }
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return extractBasicFilters(query);
  } catch (error) {
    console.error('Gemini API error:', error);
    return extractBasicFilters(query);
  }
}

function extractBasicFilters(query: string): SearchFilters {
  const filters: SearchFilters = {};
  const lowerQuery = query.toLowerCase();
  
  const categories = ['tech', 'music', 'workshop', 'meetup', 'conference', 'sports', 'art', 'hackathon', 'concert', 'festival'];
  for (const cat of categories) {
    if (lowerQuery.includes(cat)) {
      filters.category = cat;
      break;
    }
  }

  const datePatterns = [
    { pattern: /this weekend/i, days: [5, 6, 7] },
    { pattern: /today/i, days: [0] },
    { pattern: /tomorrow/i, days: [1] },
    { pattern: /this week/i, days: [0, 1, 2, 3, 4, 5, 6] },
    { pattern: /next week/i, days: [7, 8, 9, 10, 11, 12, 13] },
  ];

  for (const dp of datePatterns) {
    if (dp.pattern.test(query)) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      if (dp.pattern.test('this weekend')) {
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + (6 - dayOfWeek));
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        filters.dateFrom = saturday.toISOString();
        filters.dateTo = sunday.toISOString();
      } else if (dp.pattern.test('today')) {
        filters.dateFrom = today.toISOString();
        filters.dateTo = today.toISOString();
      } else if (dp.pattern.test('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        filters.dateFrom = tomorrow.toISOString();
        filters.dateTo = tomorrow.toISOString();
      }
      break;
    }
  }

  const words = query.split(/\s+/).filter(w => w.length > 2);
  filters.keywords = words.filter(w => 
    !['the', 'and', 'for', 'events', 'event', 'near', 'in', 'at', 'on'].includes(w.toLowerCase())
  );

  return filters;
}

export async function generateEventDescription(title: string, category: string, location: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return `Join us for ${title}, an exciting ${category} event in ${location}. Don't miss this opportunity to connect, learn, and have fun!`;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Write a short, engaging description (2-3 sentences) for an event with:
Title: ${title}
Category: ${category}
Location: ${location}

Make it exciting and professional. Do not use markdown.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      }),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
      `Join us for ${title}, an exciting ${category} event in ${location}. Don't miss this opportunity!`;
  } catch (error) {
    return `Join us for ${title}, an exciting ${category} event in ${location}. Don't miss this opportunity!`;
  }
}
