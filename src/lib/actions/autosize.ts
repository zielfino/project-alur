// src/lib/actions/autosize.ts

export function autosize(node: HTMLTextAreaElement) {
    // Fungsi 'resize' ini adalah intinya
    function resize() {
        // 1. Reset ketinggiannya agar kita bisa mendapatkan scrollHeight yang benar
        node.style.height = 'auto';
        // 2. Atur ketinggiannya menjadi scrollHeight (ketinggian total konten)
        node.style.height = `${node.scrollHeight}px`;
    }

    // Panggil 'resize' saat pertama kali diterapkan
    resize();

    // Tambahkan event listener yang akan memanggil 'resize' setiap kali pengguna mengetik
    node.addEventListener('input', resize);

    // Kembalikan metode 'destroy' untuk membersihkan event listener saat komponen hilang
    return {
        destroy() {
            node.removeEventListener('input', resize);
        }
    };
}