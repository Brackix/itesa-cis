import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Knob } from 'primereact/knob';
import { StudentService } from '../services/student.service';
import { StudentDetails } from '../types/student.types';

interface StudentProfileProps {
    studentId: string | null;
    visible: boolean;
    onHide: () => void;
}

export const StudentProfile = ({ studentId, visible, onHide }: StudentProfileProps) => {
    const [details, setDetails] = useState<StudentDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (studentId && visible) {
            setLoading(true);
            StudentService.getStudentDetails(studentId)
                .then((data) => setDetails(data))
                .catch((err) => console.error("Failed to load details", err))
                .finally(() => setLoading(false));
        } else {
            setDetails(null);
        }
    }, [studentId, visible]);

    if (!visible) return null;

    return (
        <Dialog 
            header={<span className="font-bold text-2xl"><i className="pi pi-id-card mr-2 text-primary" style={{ fontSize: '1.5rem' }}></i>Perfil de Estudiante</span>}
            visible={visible} 
            onHide={onHide}
            style={{ width: '45rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            maximizable
        >
            {loading || !details ? (
                <div className="flex justify-content-center align-items-center p-8">
                    <i className="pi pi-spin pi-spinner text-6xl text-primary"></i>
                </div>
            ) : (
                <div className="flex flex-column gap-4">
                    {/* Header: Avatar & Basic Info */}
                    <div className="flex flex-column md:flex-row align-items-center gap-5 p-4 surface-100 border-round shadow-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={details.student.image_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${details.student.name}${details.student.last_name}`} 
                            alt={details.student.alt_text || "Avatar"} 
                            className="w-8rem h-8rem border-circle border-2 border-primary shadow-3"
                            style={{ objectFit: 'cover', backgroundColor: '#e2e8f0', minWidth: '8rem' }}
                        />
                        <div className="flex flex-column align-items-center md:align-items-start gap-2">
                            <h2 className="m-0 text-4xl font-bold">{details.student.name} {details.student.last_name}</h2>
                            <div className="flex align-items-center gap-3 text-xl text-600 mt-2">
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-users"></i>
                                    Sección: <span className="font-bold text-primary">{details.student.section}</span>
                                </span>
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-list"></i>
                                    No. Lista: <span className="font-bold text-primary">{details.student.list_number}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Blocks */}
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="surface-card p-4 border-round shadow-2 h-full transition-transform transition-duration-300 hover:-translate-y-1">
                                <h4 className="m-0 mb-4 text-700 flex align-items-center gap-2 border-bottom-1 surface-border pb-2">
                                    <i className="pi pi-users text-primary"></i>
                                    Información de Grupo
                                </h4>
                                {details.group ? (
                                    <div className="flex flex-column gap-3">
                                        <div className="flex align-items-center gap-2">
                                            <span className="text-xl font-bold text-800">{details.group.group_name}</span>
                                        </div>
                                        <div>
                                            <span className={`customer-badge status-${details.role === 'coordinator' ? 'qualified' : 'negotiation'}`}>
                                                {details.role === 'coordinator' ? 'Coordinador' : 'Miembro'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-500 italic mt-0">No está asignado a ningún grupo activo.</p>
                                )}
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="surface-card p-4 border-round shadow-2 h-full transition-transform transition-duration-300 hover:-translate-y-1">
                                <h4 className="m-0 mb-4 text-700 flex align-items-center gap-2 border-bottom-1 surface-border pb-2">
                                    <i className="pi pi-box text-primary"></i>
                                    Proyecto Asignado
                                </h4>
                                {details.project ? (
                                    <div className="flex flex-column gap-2">
                                        <span className="text-xl font-bold text-800">{details.project.name}</span>
                                        {details.project.description && (
                                            <p className="m-0 mt-2 text-600 line-height-3 text-md">
                                                {details.project.description}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-500 italic mt-0">Sin proyecto registrado.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress Section */}
                    {details.project && (
                        <div className="surface-card p-4 border-round shadow-2 mt-2 transition-colors transition-duration-300 hover:surface-100">
                            <h4 className="m-0 mb-4 text-700 text-center md:text-left flex align-items-center justify-content-center md:justify-content-start gap-2">
                                <i className="pi pi-chart-line text-primary"></i>
                                Progreso de Evaluaciones
                            </h4>
                            <div className="flex flex-column md:flex-row align-items-center justify-content-center gap-6">
                                <Knob 
                                    value={details.progress} 
                                    readOnly 
                                    size={130} 
                                    valueColor="var(--primary-color)" 
                                    rangeColor="var(--surface-border)" 
                                    valueTemplate={"{value}%"}
                                />
                                <div className="flex-1 w-full text-center md:text-left">
                                    <p className="m-0 mb-3 font-bold text-lg text-800">
                                        {details.progress >= 100 ? '¡Evaluaciones Completas!' : 'Desarrollo en Curso'}
                                    </p>
                                    <ProgressBar value={details.progress} showValue={false} style={{ height: '1.2rem', borderRadius: '1rem' }} />
                                    <p className="text-sm text-600 mt-3 line-height-3">
                                        El progreso se calcula automáticamente basándose en la cantidad de logros evaluativos alcanzados vs los criterios exigidos para la fase de Feria y Preparación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Dialog>
    );
};
