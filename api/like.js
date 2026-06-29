const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get the current like count, default to 108 if it doesn't exist
      const likes = await kv.get('lantern_likes') || 108;
      return res.status(200).json({ likes });
    } else if (req.method === 'POST') {
      // Increment the like count by 1
      const likes = await kv.incr('lantern_likes');
      
      // If the database was empty, incr sets it to 1. 
      // We want our baseline to be 108, so if it's less than 108, we should set it.
      if (likes < 108) {
         await kv.set('lantern_likes', 109);
         return res.status(200).json({ likes: 109 });
      }
      
      return res.status(200).json({ likes });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in like API:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
