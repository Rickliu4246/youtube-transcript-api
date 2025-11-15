// api/index.js
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const apiDoc = {
    name: 'YouTube Transcript API',
    version: '1.0.0',
    description: 'Get YouTube video transcripts/subtitles',
    status: 'online',
    endpoints: {
      '/api/transcript': {
        method: 'GET',
        description: 'Fetch transcript for a YouTube video',
        parameters: {
          video_id: {
            type: 'string',
            required: true,
            description: 'YouTube video ID (11 characters)',
            example: 'dQw4w9WgXcQ'
          },
          lang: {
            type: 'string',
            required: false,
            default: 'zh-TW',
            description: 'Language code (ISO 639-1)',
            examples: ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'es', 'fr']
          }
        },
        examples: [
          {
            description: 'Get Chinese (Traditional) transcript',
            url: '/api/transcript?video_id=dQw4w9WgXcQ&lang=zh-TW'
          },
          {
            description: 'Get English transcript',
            url: '/api/transcript?video_id=dQw4w9WgXcQ&lang=en'
          },
          {
            description: 'Auto-detect language',
            url: '/api/transcript?video_id=dQw4w9WgXcQ'
          }
        ],
        response: {
          success: true,
          data: {
            transcript: [
              {
                text: 'Never gonna give you up',
                offset: 0,
                duration: 2500
              }
            ],
            metadata: {
              video_id: 'dQw4w9WgXcQ',
              language: 'en',
              count: 47,
              totalDuration: 213000
            }
          }
        }
      }
    },
    usage: {
      curl: 'curl "https://your-api.vercel.app/api/transcript?video_id=dQw4w9WgXcQ"',
      javascript: `
fetch('https://your-api.vercel.app/api/transcript?video_id=dQw4w9WgXcQ&lang=zh-TW')
  .then(res => res.json())
  .then(data => console.log(data));
      `.trim(),
      n8n: {
        node: 'HTTP Request',
        method: 'GET',
        url: 'https://your-api.vercel.app/api/transcript',
        parameters: {
          video_id: '{{ $json.youtubeVideoId }}',
          lang: 'zh-TW'
        }
      }
    },
    support: {
      languages: ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'vi'],
      fallback: 'Automatically tries multiple languages if requested language is not available'
    },
    author: 'Rick',
    repository: 'https://github.com/yourusername/youtube-transcript-api',
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(apiDoc);
}
