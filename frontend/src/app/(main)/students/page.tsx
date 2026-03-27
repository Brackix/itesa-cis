'use client';
import { StudentTable } from '@/src/features/students/components/StudentTable';

export default function StudentsPage() {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Gestión de Estudiantes</h5>
                    <p>Módulo para la visualización y administración de los estudiantes del sistema.</p>
                    <StudentTable />
                </div>
            </div>
        </div>
    );
}
