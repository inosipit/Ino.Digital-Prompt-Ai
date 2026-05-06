// 🤖 BACKEND SERVERLESS TELEGRAM BOT (@kritikuser_bot) VIA VERCEL
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Bot Ino.Digital Aktif, Bos!');
    }

    const token = "8107656042:AAEneeAg34SBu2l6L1EbmvMrkE1BqOWG88E";
    const adminId = "8379816457"; // 👈 KUNCI: Ganti dengan ID Telegram asli Bos (Ino)
    const telegramUrl = `https://api.telegram.org/bot${token}`;

    try {
        const { message, callback_query } = req.body;

        // --- 1. LOGIKA MENANGGAPI TOMBOL DI PANEL ADMIN ---
        if (callback_query) {
            const data = callback_query.data;
            const fromId = callback_query.from.id;

            // Trigger Aksi Kirim Voucher Massal 20 Code Contoh (Aman dari Vercel Timeout)
            if (data === 'gen_800' && String(fromId) === adminId) {
                let voucherTeks = "📋 KODE VOUCHER PREMIUM INO.DIGITAL:\n\n";
                for (let i = 0; i < 20; i++) {
                    const kode = 'INO-' + Math.random().toString(36).substring(2, 10).toUpperCase();
                    voucherTeks += `${i+1}. \`${kode}\`\n`;
                }
                
                await fetch(`${telegramUrl}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: adminId,
                        text: `✅ **SUKSES GENERATE KODE BARU, BOS!**\n\n${voucherTeks}\n*Silakan salin satu-satu untuk dijual ke user.*`,
                        parse_mode: 'Markdown'
                    })
                });
            }
            
            // Mengirim Voucher otomatis ke user target via klik tombol Admin
            if (data.startsWith('kirim_vch_') && String(fromId) === adminId) {
                const userTarget = data.replace('kirim_vch_', '');
                const voucherAcak = 'INOPREM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
                
                await fetch(`${telegramUrl}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: userTarget,
                        text: `👑 **PEMBAYARAN VALID!**\n\nIni Kode Voucher Premium 40 Hari Anda, Bos:\n\`${voucherAcak}\`\n\nSilakan masukkan kode di atas pada kolom aktivasi di website.`,
                        parse_mode: 'Markdown'
                    })
                });
            }

            return res.status(200).json({ success: true });
        }

        if (!message) return res.status(200).send('No message');
        const chatId = message.chat.id;
        const text = message.text || "";

        // --- 2. LOGIKA MENANGKAP PARAMETER /START DARI WEBSITE (FOKUS BAYAR DULU) ---
        if (text.startsWith('/start')) {
            const param = text.split(' ')[1];

            if (param === 'beli_qris') {
                await fetch(`${telegramUrl}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `👑 *PREMIUM PASS INO.DIGITAL PROMPT* 👑\n\nHarga: *Rp35.000 / 40 Hari*\n\nSilakan lakukan transfer ke QRIS resmi kami di bawah ini, Bos. Setelah berhasil, **KIRIMKAN SCREENSHOT BUKTI TRANSFER** Anda langsung ke chat bot ini ya!`,
                        parse_mode: 'Markdown'
                    })
                });
                // Kirim Gambar QRIS
                await fetch(`${telegramUrl}/sendPhoto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        photo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                    })
                });
                return res.status(200).send('OK');
            }

            if (param === 'chat_admin') {
                await fetch(`${telegramUrl}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `👨‍💻 *HUBUNGI ADMIN REAL-TIME*\n\nSilakan ketikkan langsung keluhan, pesan, atau bukti transaksi Anda di sini, Bos! Admin akan segera membaca dan merespon pesan Anda.`,
                        parse_mode: 'Markdown'
                    })
                });
                return res.status(200).send('OK');
            }

            if (param === 'setor_misi') {
                await fetch(`${telegramUrl}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `📸 *KIRIM BUKTI SS MISI GRATIS*\n\nSilakan langsung kirimkan foto bukti screenshot bahwa Anda sudah join ke 4 komunitas Ino.Digital ke sini, Bos!`,
                        parse_mode: 'Markdown'
                    })
                });
                return res.status(200).send('OK');
            }
        }

        // --- 3. JALUR SCREENSHOT MASUK: DI SINI BARU DIKASIH TAHU JADWAL OPERASIONAL ---
        if (message.photo) {
            const photoId = message.photo[message.photo.length - 1].file_id;
            
            // Forward laporan masuk ke Admin Bos
            await fetch(`${telegramUrl}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: adminId,
                    text: `🔔 **LAPORAN STRUK/MISI MASUK, BOS!**\n\nUser: @${message.from.username || 'NoUsername'}\nID Telegram: \`${chatId}\``,
                    parse_mode: 'Markdown'
                })
            });

            // Kirim fotonya ke Admin Bos beserta Inline Button Aksi Cepat
            await fetch(`${telegramUrl}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: adminId,
                    photo: photoId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "👑 ACC & Kirim Voucher Premium", callback_data: `kirim_vch_${chatId}` }],
                            [{ text: "🟢 Suntik +8 Limit (Misi)", callback_data: `suntik_free_${chatId}` }]
                        ]
                    }
                })
            });

            // Kasih tahu jadwal operasional setelah duit/ss misi aman masuk ke system Bos
            await fetch(`${telegramUrl}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `✓ **Bukti Anda telah berhasil diterima oleh sistem, Bos!**\n\n📌 *Informasi Jadwal Pengiriman Kode Voucher / Suntik Limit:*\nAdmin akan melakukan validasi data dan memproses pengiriman kode voucher secara berkala pada jam istirahat dan pulang kerja berikut:\n🕒 **JAM 12:00 - 13:00** (Jam Istirahat)\n🕒 **JAM 19:00 - 22:00** (Pulang Kerja)\n\nMohon ditunggu dengan sabar ya, Bos. Antrean akan diproses urut satu per satu. Terima kasih banyak! 🙏`,
                    parse_mode: 'Markdown'
                })
            });
        }

    } catch (error) {
        console.error("Bot Error: ", error);
    }

    return res.status(200).send('OK');
}
