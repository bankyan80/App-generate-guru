// Konfigurasi awal saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Muat semua data dari localStorage saat aplikasi dibuka
    loadGuruData();
    loadSekolahData();
    loadSiswaData();
    loadLogo();

    // Atur event listener untuk form
    document.getElementById('form-guru').addEventListener('submit', saveGuruData);
    document.getElementById('form-sekolah').addEventListener('submit', saveSekolahData);
    document.getElementById('form-siswa').addEventListener('submit', addSiswa);
    document.getElementById('logo-sekolah').addEventListener('change', handleLogoUpload);
});

// --- FUNGSI NAVIGASI TAB ---
function openTab(event, tabName) {
    let i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

// --- FUNGSI MANAJEMEN DATA GURU & SEKOLAH ---
function saveGuruData(e) {
    e.preventDefault();
    const guruData = {
        nama: document.getElementById('nama-guru').value,
        kelas: document.getElementById('kelas').value,
        tahunAjaran: document.getElementById('tahun-ajaran').value,
        semester: document.getElementById('semester').value,
    };
    localStorage.setItem('guruData', JSON.stringify(guruData));
    alert('Data guru berhasil disimpan!');
}

function loadGuruData() {
    const guruData = JSON.parse(localStorage.getItem('guruData'));
    if (guruData) {
        document.getElementById('nama-guru').value = guruData.nama;
        document.getElementById('kelas').value = guruData.kelas;
        document.getElementById('tahun-ajaran').value = guruData.tahunAjaran;
        document.getElementById('semester').value = guruData.semester;
    }
}

function saveSekolahData(e) {
    e.preventDefault();
    const sekolahData = {
        nama: document.getElementById('nama-sekolah').value,
        alamat: document.getElementById('alamat-sekolah').value,
        kepsek: document.getElementById('kepala-sekolah').value,
    };
    localStorage.setItem('sekolahData', JSON.stringify(sekolahData));
    alert('Data sekolah berhasil disimpan!');
}

function loadSekolahData() {
    const sekolahData = JSON.parse(localStorage.getItem('sekolahData'));
    if (sekolahData) {
        document.getElementById('nama-sekolah').value = sekolahData.nama;
        document.getElementById('alamat-sekolah').value = sekolahData.alamat;
        document.getElementById('kepala-sekolah').value = sekolahData.kepsek;
    }
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoDataUrl = e.target.result;
            localStorage.setItem('logoSekolah', logoDataUrl);
            document.getElementById('logo-preview').src = logoDataUrl;
            document.getElementById('logo-preview').style.display = 'block';
             alert('Logo berhasil diunggah dan disimpan!');
        }
        reader.readAsDataURL(file);
    }
}

function loadLogo() {
    const logoDataUrl = localStorage.getItem('logoSekolah');
    if (logoDataUrl) {
        document.getElementById('logo-preview').src = logoDataUrl;
        document.getElementById('logo-preview').style.display = 'block';
    }
}

// --- FUNGSI MANAJEMEN DATA SISWA ---
function addSiswa(e) {
    e.preventDefault();
    const newSiswa = {
        nama: document.getElementById('nama-siswa').value,
        nis: document.getElementById('nis-siswa').value,
        tglLahir: document.getElementById('tgl-lahir-siswa').value,
    };

    let siswaList = JSON.parse(localStorage.getItem('siswaList')) || [];
    siswaList.push(newSiswa);
    localStorage.setItem('siswaList', JSON.stringify(siswaList));

    document.getElementById('form-siswa').reset();
    loadSiswaData();
    alert('Siswa berhasil ditambahkan!');
}

function loadSiswaData() {
    const siswaList = JSON.parse(localStorage.getItem('siswaList')) || [];
    const tabelBody = document.querySelector("#tabel-siswa tbody");
    tabelBody.innerHTML = ''; // Kosongkan tabel sebelum diisi

    siswaList.forEach((siswa, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${siswa.nama}</td>
                <td>${siswa.nis}</td>
                <td>${new Date(siswa.tglLahir).toLocaleDateString('id-ID')}</td>
                <td><button class="delete-btn" onclick="deleteSiswa(${index})">Hapus</button></td>
            </tr>
        `;
        tabelBody.innerHTML += row;
    });
}

function deleteSiswa(index) {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
        let siswaList = JSON.parse(localStorage.getItem('siswaList')) || [];
        siswaList.splice(index, 1);
        localStorage.setItem('siswaList', JSON.stringify(siswaList));
        loadSiswaData();
        alert('Data siswa berhasil dihapus.');
    }
}

function handleImportCSV() {
    const fileInput = document.getElementById('import-csv');
    const file = fileInput.files[0];
    if (!file) {
        alert('Silakan pilih file CSV terlebih dahulu.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.split('\n').filter(row => row.trim()!== '');

        let siswaList = JSON.parse(localStorage.getItem('siswaList')) || [];
        let newSiswaCount = 0;

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length >= 3) {
                const newSiswa = {
                    nama: columns[0].trim(),
                    nis: columns[1].trim(),
                    tglLahir: columns[2].trim(),
                };
                siswaList.push(newSiswa);
                newSiswaCount++;
            }
        });

        localStorage.setItem('siswaList', JSON.stringify(siswaList));
        loadSiswaData();
        alert(`${newSiswaCount} siswa berhasil diimpor dari CSV!`);
        fileInput.value = ''; // Reset input file
    };
    reader.readAsText(file);
}

// --- FUNGSI GENERATE & DOWNLOAD DOKUMEN ---

function generateDoc(docType) {
    const guruData = JSON.parse(localStorage.getItem('guruData')) || {};
    const sekolahData = JSON.parse(localStorage.getItem('sekolahData')) || {};
    const siswaList = JSON.parse(localStorage.getItem('siswaList')) || [];
    const logoUrl = localStorage.getItem('logoSekolah') || '';

    const previewContainer = document.getElementById('preview-content');
    let content = '';

    // Template Header Dokumen
    const docHeader = `
        <div class="doc-header">
            <img src="${logoUrl}" alt="Logo">
            <div class="doc-header-text">
                <h4>PEMERINTAH KABUPATEN/KOTA...</h4>
                <h4>DINAS PENDIDIKAN DAN KEBUDAYAAN</h4>
                <h3>${sekolahData.nama || 'NAMA SEKOLAH'}</h3>
                <p>${sekolahData.alamat || 'Alamat Sekolah'}</p>
            </div>
            <div></div> <!-- Spacer -->
        </div>
    `;

    // Template Info Guru/Kelas
    const docInfo = `
         <div class="info-grid">
            <div><strong>Sekolah</strong>: ${sekolahData.nama || ''}</div>
            <div><strong>Kelas</strong>: ${guruData.kelas || ''}</div>
            <div><strong>Semester</strong>: ${guruData.semester || ''}</div>
            <div><strong>Tahun Ajaran</strong>: ${guruData.tahunAjaran || ''}</div>
        </div>
    `;

    switch (docType) {
        case 'daftar-hadir':
            content = `
                <div id="preview-daftar-hadir" class="doc-preview">
                    ${docHeader}
                    <div class="doc-title">DAFTAR HADIR SISWA</div>
                    ${docInfo}
                    <table border="1" style="width:100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background-color:#f2f2f2;">
                                <th rowspan="2">No</th>
                                <th rowspan="2">Nama Siswa</th>
                                <th rowspan="2">L/P</th>
                                <th colspan="31">Tanggal</th>
                            </tr>
                            <tr>
                                ${Array.from({ length: 31 }, (_, i) => `<th>${i + 1}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${siswaList.map((s, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td style="text-align:left; padding: 4px;">${s.nama}</td>
                                    <td></td>
                                    ${Array.from({ length: 31 }, () => `<td></td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'jurnal-harian':
            content = `
                <div id="preview-jurnal-harian" class="doc-preview">
                    ${docHeader}
                    <div class="doc-title">JURNAL HARIAN GURU</div>
                    ${docInfo}
                    <table border="1" style="width:100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                           <tr style="background-color:#f2f2f2;">
                                <th>Hari/Tanggal</th>
                                <th>Mata Pelajaran</th>
                                <th>Tema/Subtema/Materi Pokok</th>
                                <th>Kegiatan Pembelajaran</th>
                                <th>Penilaian</th>
                                <th>Keterangan</th>
                           </tr>
                        </thead>
                        <tbody>
                            ${Array.from({ length: 10 }, () => `
                                <tr>
                                    <td style="height: 50px;"></td><td></td><td></td><td></td><td></td><td></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'prota':
             content = `<div id="preview-prota" class="doc-preview">${docHeader}<div class="doc-title">PROGRAM TAHUNAN (PROTA)</div>${docInfo}<p><i>Konten PROTA akan ditampilkan di sini. Anda bisa membuat editor atau form input untuk mengisinya.</i></p></div>`;
             break;

        case 'prosem':
             content = `<div id="preview-prosem" class="doc-preview">${docHeader}<div class="doc-title">PROGRAM SEMESTER (PROSEM)</div>${docInfo}<p><i>Konten PROSEM akan ditampilkan di sini.</i></p></div>`;
             break;

        // Tambahkan case untuk dokumen lain di sini
        default:
            content = 'Pilih jenis dokumen yang valid.';
    }

    previewContainer.innerHTML = content;
}

function downloadPDF(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        alert("Silakan 'Generate' dokumen terlebih dahulu sebelum mengunduh.");
        return;
    }

    const opt = {
        margin: [10, 10, 10, 10], // top, left, bottom, right in mm
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } // Ubah ke landscape jika perlu
    };

    html2pdf().from(element).set(opt).save();
}
