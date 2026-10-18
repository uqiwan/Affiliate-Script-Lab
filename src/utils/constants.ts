/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContentAngle {
  id: string;
  name: string;
  description: string;
  recommendedFor: string;
}

export const CONTENT_ANGLES: ContentAngle[] = [
  {
    id: 'pas',
    name: '1. Problem-Solution / PAS',
    description: 'Angkat masalah spesifik, perjelas dampak kekecewaannya, hadirkan produk sebagai solusi logis.',
    recommendedFor: 'Produk fungsional dengan problem jelas',
  },
  {
    id: 'personal_story',
    name: '2. Personal Story / Vulnerability',
    description: 'Cerita pengalaman personal nyata yang relatable dan jujur.',
    recommendedFor: 'Membangun trust dan koneksi emosional',
  },
  {
    id: 'bold_claim',
    name: '3. Bold Claim / Counter-Narrative',
    description: 'Pernyataan berani yang melawan persepsi umum, dibuktikan langsung dengan fakta nyata.',
    recommendedFor: 'Pattern interrupt di detik awal',
  },
  {
    id: 'myth_busting',
    name: '4. Myth-Busting (Mitos vs Fakta)',
    description: 'Membongkar miskonsepsi umum masyarakat yang selama ini salah kaprah.',
    recommendedFor: 'Edukasi dan produk alternatif cerdas',
  },
  {
    id: 'outcome_first',
    name: '5. Outcome-First / Transformasi',
    description: 'Tunjukkan hasil akhir/kondisi ideal terlebih dahulu di 3 detik awal.',
    recommendedFor: 'Visual demonstrasi yang memuaskan',
  },
  {
    id: 'common_mistakes',
    name: '6. Common Mistakes / Stop Doing This',
    description: 'Peringatan kesalahan umum yang sering dilakukan penonton tanpa disadari.',
    recommendedFor: 'Menahan scroll dan menimbulkan rasa ingin tahu',
  },
  {
    id: 'price_value',
    name: '7. Price/Value Comparison / Anchoring',
    description: 'Bandingkan nilai fungsional dengan harga pembanding atau biaya alternatif yang wajar.',
    recommendedFor: 'Produk bernilai tinggi dengan harga terjangkau',
  },
  {
    id: 'unboxing',
    name: '8. Unboxing & First Impression',
    description: 'Sensasi membuka paket, sentuhan pertama tekstur, kelengkapan kemasan.',
    recommendedFor: 'Produk dengan packaging rapi atau pengalaman membuka unik',
  },
  {
    id: 'pov_relatable',
    name: '9. POV / Relatable',
    description: 'Situasi nyata yang dihadapi segmen audiens tertentu (misal: anak kost, pekerja WFH).',
    recommendedFor: 'Koneksi instan dengan kelompok tertentu',
  },
  {
    id: 'educational',
    name: '10. Educational / Mini Tutorial',
    description: 'Tips singkat langkah demi langkah yang memberikan value praktis.',
    recommendedFor: 'Membangun otoritas dan saved video tinggi',
  },
  {
    id: 'testing_viral',
    name: '11. Testing Viral Product / Curiosity',
    description: 'Uji apakah produk yang lagi ramai benar-benar sesuai omongan netizen.',
    recommendedFor: 'Produk tren atau sering lewat FYP',
  },
  {
    id: 'day_in_life',
    name: '12. Day in My Life / In-Context Use',
    description: 'Produk diselipkan secara natural dalam rutinitas keseharian.',
    recommendedFor: 'Soft selling dan konten organik',
  },
  {
    id: 'behind_scenes',
    name: '13. Behind the Scenes / Feature Secrets',
    description: 'Sorot detail fitur kecil atau rahasia kegunaan yang jarang diperhatikan.',
    recommendedFor: 'Produk dengan inovasi unik tersembunyi',
  },
  {
    id: 'stress_test',
    name: '14. Extreme Stress Test (Aman & Relevan)',
    description: 'Uji ketahanan atau efektivitas secara langsung dan aman di depan kamera.',
    recommendedFor: 'Produk anti-rusak, tahan air, atau daya rekat kuat',
  },
  {
    id: 'regret_angle',
    name: '15. Regret Angle / "Kenapa baru tahu?"',
    description: 'Rasa penyesalan positif kenapa baru menemukan solusi ini setelah sekian lama.',
    recommendedFor: 'Solusi yang menghemat waktu atau uang',
  },
  {
    id: 'head_to_head',
    name: '16. Head-to-Head Comparison',
    description: 'Perbandingan objektif dengan opsi konvensional yang sebanding.',
    recommendedFor: 'Hanya jika data pembanding tersedia memadai',
  },
  {
    id: 'secret_hacks',
    name: '17. Secret Hacks / Trik Tersembunyi',
    description: 'Trik praktis mempermudah hidup dengan memanfaatkan produk ini.',
    recommendedFor: 'Kreativitas pemakaian & share-ability',
  },
  {
    id: 'social_proof',
    name: '18. Social Proof / Review Netizen',
    description: 'Membahas ulasan nyata netizen yang sudah membuktikan produk ini.',
    recommendedFor: 'Hanya jika ulasan nyata disediakan oleh pengguna',
  },
  {
    id: 'gift_recom',
    name: '19. Gift & Recommendation',
    description: 'Rekomendasi hadiah atau barang wajib punya untuk teman/keluarga.',
    recommendedFor: 'Momen belanja, kado, atau hadiah bermanfaat',
  },
  {
    id: 'emergency_fix',
    name: '20. Emergency / Quick Fix',
    description: 'Solusi cepat untuk situasi genting tanpa menjanjikan hal tak masuk akal.',
    recommendedFor: 'Produk penolong darurat dan serbaguna',
  },
];

export const DURATION_WORD_TARGETS = {
  15: { min: 30, max: 40, label: '15 detik (30–40 kata narasi)' },
  30: { min: 60, max: 75, label: '30 detik (60–75 kata narasi)' },
  60: { min: 125, max: 150, label: '60 detik (125–150 kata narasi)' },
  90: { min: 200, max: 225, label: '90 detik (200–225 kata narasi)' },
} as const;

export const SAFE_ZONE_GUIDE = {
  resolution: '1080 x 1920 px (9:16 vertical)',
  topMargin: '130 px (hindari ikon Live / Search / tab)',
  rightMargin: '140 px (hindari avatar, like, komentar, bookmark, share)',
  bottomMargin: '484 px (hindari caption, sound title, tombol keranjang affiliate di kiri bawah)',
  leftMargin: '44 px',
  safeAreaRect: 'x: 44–940 px, y: 130–1436 px',
  note: 'Safe zone adalah panduan editing sumber riset, bukan jaminan statis. Letakkan teks overlay penting di area tengah, kontras tinggi, ringkas, dan tidak menutupi produk.',
};
