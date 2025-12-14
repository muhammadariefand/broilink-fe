import React, { useState } from 'react';
import axios from 'axios';

const SimulationPage = () => {
    // State buat nyimpen nilai inputan
    const [formData, setFormData] = useState({
        farm_id: 1, // Default ke Kandang 1 (Budi)
        temperature: 30,
        humidity: 60,
        ammonia: 10
    });
    const [status, setStatus] = useState('');

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
        setStatus('Mengirim...');
        
        try {
            // Ganti URL sesuai backendmu
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            
            await axios.post(`${API_URL}/api/simulation/iot`, formData);
            
            setStatus('✅ Sukses! Cek Dashboard.');
        } catch (error) {
            console.error(error);
            setStatus('❌ Gagal: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>🎛️ Ruang Kontrol IoT (Simulasi)</h1>
            <p>Gunakan halaman ini untuk memaksa masuk data baru tanpa menunggu alat asli.</p>
            
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Pilih Kandang */}
                <div>
                    <label><strong>Pilih ID Kandang:</strong></label>
                    <select 
                        name="farm_id" 
                        value={formData.farm_id} 
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px' }}
                    >
                        <option value="1">Kandang 1 (Budi)</option>
                        <option value="2">Kandang 2 (Siti A)</option>
                        <option value="3">Kandang 3 (Siti B)</option>
                    </select>
                </div>

                {/* Slider Suhu */}
                <div>
                    <label><strong>Suhu (°C): {formData.temperature}</strong></label>
                    <input 
                        type="range" name="temperature" 
                        min="20" max="45" step="0.1"
                        value={formData.temperature} onChange={handleChange}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Slider Kelembapan */}
                <div>
                    <label><strong>Kelembapan (%): {formData.humidity}</strong></label>
                    <input 
                        type="range" name="humidity" 
                        min="30" max="99" 
                        value={formData.humidity} onChange={handleChange}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Slider Amonia */}
                <div>
                    <label><strong>Amonia (ppm): {formData.ammonia}</strong></label>
                    <input 
                        type="range" name="ammonia" 
                        min="0" max="50" step="0.5"
                        value={formData.ammonia} onChange={handleChange}
                        style={{ width: '100%' }}
                    />
                </div>

                <button 
                    type="submit" 
                    style={{ 
                        padding: '15px', 
                        backgroundColor: '#2ecc71', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}
                >
                    🚀 KIRIM DATA BARU
                </button>
            </form>

            {status && <div style={{ marginTop: '20px', padding: '10px', background: '#eee' }}>{status}</div>}
        </div>
    );
};

export default SimulationPage;