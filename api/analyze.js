const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
    // Jalur proteksi metode tembakan request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method tidak diizinkan, Bos!' });
    }

    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Gambar Base64 tidak dimuat, Bos!' });
        }

        // Mengambil API Key rahasia dari environment variable Vercel Bos
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Kunci rahasia GEMINI_API_KEY belum dipasang di dashboard Vercel, Bos!' });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        // Perintah system prompt agar Gemini mengekstrak komponen gambar menjadi prompt matang
        const promptInstruction = "Analyze this image and extract its components to generate a highly detailed prompt for image generation. Include aspect ratio, style, lighting, camera lens description, textures, colors, and clothing details. Output ONLY the prompt in English text, no greetings or explanations.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                promptInstruction,
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: image
                    }
                }
            ]
        });

        // Kembalikan teks prompt matang ke frontend index.html
        return res.status(200).json({ text: response.text });

    } catch (error) {
        return res.status(500).json({ error: 'API Gemini sedang padat lintasan, Bos!' });
    }
};
