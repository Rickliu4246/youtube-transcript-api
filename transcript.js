// api/transcript.js
import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  // 設定 CORS（允許 n8n 調用）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 處理 OPTIONS 請求（CORS preflight）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // 從 query 或 body 獲取參數
    const { video_id, lang = 'zh-TW' } = 
      req.method === 'GET' ? req.query : req.body;
    
    // 驗證參數
    if (!video_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing video_id parameter',
        usage: {
          method: 'GET',
          url: '/api/transcript',
          parameters: {
            video_id: 'YouTube video ID (required)',
            lang: 'Language code (optional, default: zh-TW)'
          },
          example: '/api/transcript?video_id=dQw4w9WgXcQ&lang=zh-TW'
        }
      });
    }
    
    console.log(`[${new Date().toISOString()}] Fetching transcript for: ${video_id}, lang: ${lang}`);
    
    // 嘗試獲取字幕（支持多語言備選）
    let transcript = null;
    let usedLanguage = lang;
    const fallbackLanguages = [lang, 'zh-TW', 'zh-CN', 'en', 'ja', 'ko'];
    const uniqueLanguages = [...new Set(fallbackLanguages)];
    
    for (const tryLang of uniqueLanguages) {
      try {
        transcript = await YoutubeTranscript.fetchTranscript(video_id, {
          lang: tryLang
        });
        usedLanguage = tryLang;
        console.log(`[${new Date().toISOString()}] Success with language: ${tryLang}`);
        break;
      } catch (error) {
        console.log(`[${new Date().toISOString()}] Failed with ${tryLang}: ${error.message}`);
        if (tryLang === uniqueLanguages[uniqueLanguages.length - 1]) {
          throw new Error(`No transcript available. Tried languages: ${uniqueLanguages.join(', ')}`);
        }
      }
    }
    
    if (!transcript) {
      throw new Error('Unable to fetch transcript');
    }
    
    console.log(`[${new Date().toISOString()}] Success! Got ${transcript.length} items`);
    
    // 計算總時長
    const totalDuration = transcript.reduce((sum, item) => sum + (item.duration || 0), 0);
    
    // 返回成功結果
    res.status(200).json({
      success: true,
      data: {
        transcript: transcript,
        metadata: {
          video_id: video_id,
          language: usedLanguage,
          requestedLanguage: lang,
          count: transcript.length,
          totalDuration: totalDuration,
          totalDurationFormatted: `${Math.floor(totalDuration / 1000 / 60)}:${String(Math.floor((totalDuration / 1000) % 60)).padStart(2, '0')}`
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
    
    // 返回錯誤
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        video_id: req.query.video_id || req.body?.video_id || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  }
}
