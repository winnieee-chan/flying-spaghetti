// src/services/llmService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ExtractedKeywords } from '../types/index.js';

// Regex-based fallback extraction
const extractWithRegex = (jd_text: string, job_title: string): ExtractedKeywords => {
    const text = (jd_text + ' ' + job_title).toLowerCase();

    const skillPatterns = {
        languages: ['python', 'javascript', 'typescript', 'java', 'c\\+\\+', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala'],
        frameworks: ['react', 'angular', 'vue', 'next\\.?js', 'node\\.?js', 'django', 'flask', 'fastapi', 'spring', 'express', 'laravel', 'rails'],
        databases: ['postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'oracle'],
        cloud: ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean'],
        devops: ['docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible'],
        other: ['git', 'graphql', 'rest api', 'microservices', 'agile', 'scrum', 'ci/cd', 'tdd', 'machine learning', 'ml', 'ai']
    };

    const foundSkills: string[] = [];
    Object.values(skillPatterns).flat().forEach(pattern => {
        const regex = new RegExp(`\\b${pattern}\\b`, 'i');
        if (regex.test(text)) {
            const skill = pattern.replace(/\\b|\\/g, '');
            foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    });

    const skills = foundSkills.length > 0 ? [...new Set(foundSkills)].slice(0, 8) : ['General Programming'];

    const expPatterns = [
        /(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience/i,
        /minimum\s+(\d+)\s*years?/i,
        /(\d+)\s*-\s*\d+\s*years?/i,
        /at least\s+(\d+)\s*years?/i
    ];

    let min_experience_years = 3;
    for (const pattern of expPatterns) {
        const match = text.match(pattern);
        if (match) {
            min_experience_years = parseInt(match[1]);
            break;
        }
    }

    const locationPatterns = [
        /location[:\s]+([a-z\s]+?)(?:\.|,|$)/i,
        /based in ([a-z\s]+?)(?:\.|,|$)/i,
        /\b(remote|hybrid|onsite|on-site)\b/i
    ];

    const cityList = ['remote', 'hybrid', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide',
        'san francisco', 'new york', 'london', 'berlin', 'singapore', 'bangalore',
        'toronto', 'austin', 'seattle', 'boston', 'amsterdam', 'dublin', 'paris'];

    let location = 'Remote';
    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) {
            location = match[1].trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            break;
        }
    }

    if (location === 'Remote') {
        const foundCity = cityList.find(city => text.includes(city));
        if (foundCity) {
            location = foundCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }

    return {
        role: job_title || "Software Engineer",
        skills,
        min_experience_years,
        location
    };
};

// OpenAI fallback
const extractWithOpenAI = async (jd_text: string, job_title: string): Promise<ExtractedKeywords> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not available');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Extract key information from this job description and return ONLY valid JSON:\n\nJob Title: ${job_title}\n\n${jd_text}\n\nReturn format: {"role": "...", "skills": [...], "min_experience_years": 0, "location": "..."}`
            }],
            temperature: 0.3
        })
    });

    const data = await response.json() as any;
    const content = data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const extracted = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
        role: extracted.role || job_title,
        skills: Array.isArray(extracted.skills) ? extracted.skills : [],
        min_experience_years: extracted.min_experience_years || 3,
        location: extracted.location || 'Remote'
    };
};

/**
 * Calls the Google Gemini API to extract structured keywords from a JD.
 * Falls back to OpenAI if available, then regex extraction.
 */
export const runSynchronousLLM = async (jd_text: string, job_title: string): Promise<ExtractedKeywords> => {

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

    // Try Gemini first
    if (apiKey) {

        try {
            console.log(`[LLM] Calling Google Gemini API (${modelName}) for: ${job_title}...`);

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `Extract key information from the following job description and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just the JSON):

{
  "role": "job title or role name",
  "skills": ["skill1", "skill2", "skill3"],
  "min_experience_years": number,
  "location": "city or location name"
}

Job Title: ${job_title}
Job Description:
${jd_text}

Return only the JSON object, nothing else.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log(response)
            const text = response.text().trim();

            let jsonText = text;
            if (text.startsWith('```json')) {
                jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            } else if (text.startsWith('```')) {
                jsonText = text.replace(/```\n?/g, '').trim();
            }

            const extracted = JSON.parse(jsonText) as Partial<ExtractedKeywords>;

            return {
                role: extracted.role || job_title || "Software Engineer",
                skills: Array.isArray(extracted.skills) ? extracted.skills : ["Python", "FastAPI", "Postgres"],
                min_experience_years: extracted.min_experience_years || 3,
                location: extracted.location || "Remote"
            };

        } catch (error: any) {
            console.error('[LLM] Gemini API failed:', error.message);
        }
    }

    // Final fallback to regex
    console.log('[LLM] Using regex fallback extraction.');
    return extractWithRegex(jd_text, job_title);
};