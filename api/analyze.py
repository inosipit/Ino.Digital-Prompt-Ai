import os
import json
import urllib.request
import urllib.parse

def handler(request):
    # Hanya menerima metode POST kiriman foto dari frontend
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Metode tidak diizinkan'})
        }

    try:
        # Membaca body request foto base64
        req_body = json.loads(request.body.decode('utf-8'))
        image_base64 = req_body.get("image", "")
        
        # Mengambil API Key rahasia dari Settings Vercel
        api_key = os.environ.get("GEMINI_API_KEY")
        
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'API Key Gemini belum diisi di Environment Variables Vercel Bos!'})
            }

        # Setup URL Google Gemini API 1.5 Flash (Sangat Cepat & Akurat)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        instruksi_analisis = (
            "Analisis foto referensi ini secara mendalam untuk kebutuhan profesional AI Image Generation Prompt (seperti Midjourney, Stable Diffusion, atau Gemini App).\n\n"
            "=== ATURAN UTAMA (WAJIB & MUTLAK) ===\n"
            "1. JAGA WAJAH ASLI: Saat membuat output prompt, instruksikan AI generator untuk MENGGUNAKAN WAJAH ASLI dari foto referensi ini secara TOTAL.\n"
            "2. TANPA MODIFIKASI WAJAH: Wajah harus tetap realistis, identik, dan fotorealistik dengan foto asli. Dilarang mengubah bentuk wajah, fitur wajah, atau ekspresi dasar yang membuatnya tidak dikenali.\n"
            "3. Identitas wajah harus 100% sama dengan input.\n\n"
            "=== FORMAT OUTPUT BAHASA INDONESIA ===\n"
            "Berikan hasil analisis dalam Bahasa Indonesia yang rapi dengan poin-poin berikut:\n"
            "- Subjek Utama\n"
            "- Pakaian & Atribut\n"
            "- Latar Belakang/Suasana\n"
            "- Pencahayaan & Gaya Kamera\n"
            "- Postur Tubuh (Detail, tinggi, pose)\n\n"
            "=== FORMAT PROMPT ENGLISH (DI PALING BAWAH) ===\n"
            "Tuliskan kata 'PROMPT ENGLISH:' (huruf besar semua), lalu buatkan satu paragraf prompt English yang sangat detail, fotorealistik, dan hyper-realistic.\n\n"
            "Suntikkan perintah English di dalam prompt tersebut (seperti: 'utilizing the exact, unmodified, highly detailed face from the reference image', 'photorealistic identity match', 'the face remains completely identical to the source, without any AI alteration or smoothing')."
        )

        gemini_payload = {
            "contents": [{
                "parts": [
                    {"text": instruksi_analisis},
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "topP": 0.8,
                "topK": 40
            }
        }

        # Hantam data ke server Google API
        req = urllib.request.Request(
            url,
            data=json.dumps(gemini_payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )

        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            extracted_text = res_data['candidates'][0]['content']['parts'][0]['text']
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'text': extracted_text})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Sistem Crash: {str(e)}'})
        }
