import React, { useState } from 'react';
import axios from 'axios';

const SimulationPage = () => {
    // State buat nyimpen nilai inputan
    const [formData, setFormData] = useState({
        farm_id: 1, // Default ke Kandang 1
        temperature: 30,
        humidity: 60,
        ammonia: 10
    });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // Fungsi pas nilai diganti
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Fungsi kirim ke Backend
    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('Mengirim data ke server...');
        
        try {
            // --- BAGIAN PENTING: ALAMAT SERVER ---
            // Pastikan php artisan serve jalan di port 8000
            const BASE_URL = 'http://127.0.0.1:8000'; 
            
            // Endpoint sesuai api.php: /api/simulation/iot
            const url = `${BASE_URL}/api/simulation/iot`;
            
            console.log("Mengirim ke:", url); // Cek di Console browser kalo error

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log("Response:", response.data);
            setStatus('✅ SUKSES! Data berhasil masuk. Cek Dashboard/Bot.');
        } catch (error) {
            console.error("Error Detail:", error);
            
            // Deteksi pesan error biar jelas
            let pesanError = error.message;
            if (error.code === 'ERR_CONNECTION_REFUSED') {
                pesanError = 'Gagal Konek! Pastikan "php artisan serve" sudah jalan.';
            } else if (error.response) {
                pesanError = `Server Error (${error.response.status}): ${error.response.data.message || 'Cek backend'}`;
            }
            
            setStatus('❌ GAGAL: ' + pesanError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1 style={{ color: '#2c3e50' }}>🎛️ Ruang Kontrol IoT</h1>
                <p style={{ color: '#7f8c8d' }}>Simulasi kirim data sensor tanpa alat asli</p>
            </div>
            
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                
                {/* Pilih Kandang */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📍 Pilih ID Kandang:</label>
                    <select 
                        name="farm_id" 
                        value={formData.farm_id} 
                        onChange={handleChange}
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
                    >
                        <option value="1">Kandang 1</option>
                        <option value="2">Kandang 2</option>
                        <option value="3">Kandang 3</option>
                    </select>
                </div>

                {/* Slider Suhu */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontWeight: 'bold' }}>🌡️ Suhu (°C)</label>
                        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formData.temperature}°C</span>
                    </div>
                    <input 
                        type="range" name="temperature" 
                        min="20" max="45" step="0.1"
                        value={formData.temperature} onChange={handleChange}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>

                {/* Slider Kelembapan */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontWeight: 'bold' }}>💧 Kelembapan (%)</label>
                        <span style={{ color: '#3498db', fontWeight: 'bold' }}>{formData.humidity}%</span>
                    </div>
                    <input 
                        type="range" name="humidity" 
                        min="30" max="99" 
                        value={formData.humidity} onChange={handleChange}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>

                {/* Slider Amonia */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontWeight: 'bold' }}>☣️ Amonia (ppm)</label>
                        <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{formData.ammonia} ppm</span>
                    </div>
                    <input 
                        type="range" name="ammonia" 
                        min="0" max="50" step="0.5"
                        value={formData.ammonia} onChange={handleChange}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '15px', 
                        backgroundColor: loading ? '#95a5a6' : '#2ecc71', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: '0.3s',
                        marginTop: '10px'
                    }}
                >
                    {loading ? '⏳ Sedang Mengirim...' : '🚀 KIRIM DATA SEKARANG'}
                </button>
            </form>

            {status && (
                <div style={{ 
                    marginTop: '25px', 
                    padding: '15px', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '500',
                    backgroundColor: status.includes('SUKSES') ? '#d4edda' : (status.includes('Mengirim') ? '#fff3cd' : '#f8d7da'),
                    color: status.includes('SUKSES') ? '#155724' : (status.includes('Mengirim') ? '#856404' : '#721c24'),
                    border: `1px solid ${status.includes('SUKSES') ? '#c3e6cb' : (status.includes('Mengirim') ? '#ffeeba' : '#f5c6cb')}`
                }}>
                    {status}
                </div>
            )}
        </div>
    );
};

export default SimulationPage;