import React, { useState } from 'react';
import {
    Map,
    MapPin,
    Navigation,
    Users,
    Clock
} from 'lucide-react';

export default function GpsTracking() {
    const [selectedUser, setSelectedUser] = useState(null);

    // Mock data for field employees
    const fieldEmployees = [
        { id: 1, name: 'Michael Sales', role: 'Sales Rep', status: 'moving', last_updated: '2 mins ago', loc: 'Downtown Avenue' },
        { id: 2, name: 'Sarah Field', role: 'Field Agent', status: 'stationary', last_updated: '15 mins ago', loc: 'Client Site A' },
        { id: 3, name: 'David Driver', role: 'Delivery', status: 'moving', last_updated: 'Just now', loc: 'Highway 42' },
    ];

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between mb-4">
                <div>
                    <h1 className="title-lg mb-1 flex items-center gap-2">
                        <Map className="text-primary" size={32} /> GPS Tracking
                    </h1>
                    <p className="subtitle">Real-time location monitoring for field staff</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-success"><div className="w-2 h-2 rounded-full bg-white animate-pulse inline-block mr-2" /> Live Tracking Active</span>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>

                {/* User List Sidebar */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div className="p-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <h3 className="title-md m-0 flex items-center gap-2">
                            <Users size={18} /> Field Team
                        </h3>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                        {fieldEmployees.map(emp => (
                            <div
                                key={emp.id}
                                className={`p-3 mb-3 rounded-lg cursor-pointer transition-all ${selectedUser === emp.id ? 'bg-primary-light shadow-sm scale-[1.02]' : 'bg-slate-50 hover:bg-slate-100'}`}
                                onClick={() => setSelectedUser(emp.id)}
                                style={{ border: selectedUser === emp.id ? '1px solid var(--primary-main)' : '1px solid var(--border-light)' }}
                            >
                                <div className="flex-between mb-1">
                                    <span className="font-bold text-main">{emp.name}</span>
                                    {emp.status === 'moving' ? (
                                        <span className="badge badge-info py-0 px-2 text-xs"><Navigation size={10} className="inline mr-1" /> Moving</span>
                                    ) : (
                                        <span className="badge badge-warning py-0 px-2 text-xs"><MapPin size={10} className="inline mr-1" /> Stationary</span>
                                    )}
                                </div>
                                <div className="text-xs text-muted mb-2">{emp.role}</div>

                                <div className="flex items-center gap-2 text-xs text-secondary mt-2 pt-2" style={{ borderTop: '1px dashed var(--border-light)' }}>
                                    <Clock size={12} /> {emp.last_updated}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map Container Area */}
                <div className="glass-card flex-center flex-col relative" style={{ overflow: 'hidden', padding: 0 }}>
                    {/* This is a placeholder for a real map integration like Google Maps or Leaflet */}
                    <div className="absolute inset-0 bg-slate-100 flex-center" style={{
                        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        opacity: 0.5
                    }}></div>

                    {selectedUser ? (
                        <div className="z-10 flex-center flex-col p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200">
                            <MapPin className="text-primary animate-bounce mb-4" size={48} />
                            <h3 className="title-lg m-0 bg-gradient-to-r from-primary-main to-info-main bg-clip-text text-transparent">Tracking: {fieldEmployees.find(e => e.id === selectedUser)?.name}</h3>
                            <p className="text-muted mt-2">Current Location: <strong>{fieldEmployees.find(e => e.id === selectedUser)?.loc}</strong></p>
                            <button className="btn btn-secondary mt-6">View Location History</button>
                        </div>
                    ) : (
                        <div className="z-10 text-center p-8">
                            <Map className="mx-auto text-slate-300 mb-4" size={64} />
                            <h3 className="title-md text-slate-400">Select an employee from the list to view their live location.</h3>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
}
