'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { api } from '@/src/services/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { username, password });
            if (response.data.token) {
                document.cookie = `token=${response.data.token}; path=/; max-age=43200; SameSite=Strict`;
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }} className="p-4 w-full">
            <style dangerouslySetInnerHTML={{__html: `
                .modern-input {
                    background: #18181b !important;
                    border: 1px solid #27272a !important;
                    color: #f4f4f5 !important;
                    padding: 0.875rem 1rem !important;
                    border-radius: 8px !important;
                    font-size: 0.95rem !important;
                    transition: border-color 0.2s, box-shadow 0.2s !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }
                .modern-input:focus, .p-password-input:focus {
                    border-color: #52525b !important;
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05) !important;
                    outline: none !important;
                }
                .p-password-input {
                    background: #18181b !important;
                    border: 1px solid #27272a !important;
                    color: #f4f4f5 !important;
                    padding: 0.875rem 1rem !important;
                    border-radius: 8px !important;
                    font-size: 0.95rem !important;
                    font-family: monospace !important;
                    width: 100% !important;
                    transition: border-color 0.2s, box-shadow 0.2s !important;
                }
                .p-password-icon {
                    color: #52525b !important;
                    margin-top: -0.5rem !important;
                }
                .modern-btn {
                    background: #fafafa !important;
                    color: #09090b !important;
                    border: 1px solid #fafafa !important;
                    border-radius: 8px !important;
                    font-weight: 600 !important;
                    font-size: 0.95rem !important;
                    padding: 0.875rem 1rem !important;
                    transition: all 0.2s !important;
                }
                .modern-btn:hover {
                    background: #e4e4e7 !important;
                    border-color: #e4e4e7 !important;
                }
                .error-box {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 0.875rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                }
            `}} />

            <div style={{ width: '100%', maxWidth: '400px' }} className="flex flex-column">
                <div className="text-center mb-5">
                    <h1 style={{ color: '#fafafa', fontSize: '1.85rem', fontWeight: 600, letterSpacing: '-0.025em', margin: '0 0 0.5rem 0' }}>ITESACIS</h1>
                    <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.95rem' }}>Ecosistema Inteligente de Gestión</p>
                </div>

                <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '2rem' }}>
                    <form onSubmit={handleLogin} className="flex flex-column gap-4 w-full m-0 p-0">
                        {error && (
                            <div className="error-box flex align-items-center justify-content-center text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-column gap-2">
                            <label htmlFor="username" style={{ color: '#e4e4e7', fontSize: '0.875rem', fontWeight: 500 }}>Usuario</label>
                            <InputText 
                                id="username" 
                                type="text" 
                                placeholder="usuario@itesacis.edu.do"
                                className="modern-input w-full"
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex flex-column gap-2 mb-2">
                            <label htmlFor="password" style={{ color: '#e4e4e7', fontSize: '0.875rem', fontWeight: 500 }}>Contraseña</label>
                            <Password 
                                inputId="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                toggleMask 
                                placeholder="••••••••" 
                                className="w-full"
                                required 
                                feedback={false} 
                            />
                        </div>

                        <Button 
                            label="Ingresar" 
                            className="modern-btn w-full mt-2"
                            type="submit" 
                            loading={loading}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}
