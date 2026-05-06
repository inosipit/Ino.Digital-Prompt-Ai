export default async function handler(request, response) {
    // Mengatur header CORS agar frontend aman dari pemblokiran browser
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Metode tidak diizinkan' });
    }

    try {
        const { image } = request.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return response.status(500).json({ error: 'API Key Gemini belum diisi di Environment Variables Vercel, Bos!' });
        }

        if (!image) {
            return response.status(400).json({ error: 'Mana foto referensinya, Bos? Server tidak menerima data.' });
        }

        // Jalur Google Gemini API 1.5 Flash Resmi
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const instruksi_analisis = 
            "Analisis foto referensi ini secara mendalam untuk kebutuhan profesional AI Image Generation Prompt (seperti Midjourney, Stable Diffusion, atau Gemini App).\n\n" +
            "=== ATURAN UTAMA (WAJIB & MUTLAK) ===\n" +
            "1. JAGA WAJAH ASLI: Saat membuat output prompt, instruksikan AI generator untuk MENGGUNAKAN WAJAH ASLI dari foto referensi ini secara TOTAL.\n" +
            "2. TANPA MODIFIKASI WAJAH: Wajah harus tetap realistis, identik, dan fotorealistik dengan foto asli. Dilarang mengubah bentuk wajah, fitur wajah, atau ekspresi dasar yang membuatnya tidak dikenali.\n" +
            "3. Identitas wajah harus 100% sama dengan input.\n\n" +
            "=== FORMAT OUTPUT BAHASA INDONESIA ===\n" +
            "Berikan hasil analisis dalam Bahasa Indonesia yang rapi dengan poin-poin berikut:\n" +
            "- Subjek Utama\n" +
            "- Pakaian & Atribut\n" +
            "- Latar Belakang/Suasana\n" +
            "- Pencahayaan & Gaya Kamera\n" +
            "- Postur Tubuh (Detail, tinggi, pose, bentuk badan)\n\n" +
            "=== FORMAT PROMPT ENGLISH (DI PALING BAWAH) ===\n" +
            "Tuliskan kata 'PROMPT ENGLISH:' (huruf besar semua), lalu buatkan satu paragraf prompt English yang sangat detail, fotorealistik, dan hyper-realistic.\n\n" +
            "Suntikkan perintah English di dalam prompt tersebut (seperti: 'utilizing the exact, unmodified, highly detailed face from the reference image', 'photorealistic identity match', 'the face remains completely identical to the source, without any AI alteration or smoothing').";

        const geminiPayload = {
            contents: [{
                parts: [
                    { text: instruksi_analisis },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.3,
                topP: 0.8,
                topK: 40
            }
        };

        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload)
        });

        if (!geminiResponse.ok) {
            const errData = await geminiResponse.json();
            return response.status(500).json({ error: `Google API Error: ${JSON.stringify(errData)}` });
        }

        const data = await geminiResponse.json();
        const extractedText = data.candidates[0].content.parts[0].text;

        return response.status(200).json({ text: extractedText });

    } catch (error) {
        return response.status(500).json({ error: `Server Crash Internal: ${error.message}` });
    }
}
