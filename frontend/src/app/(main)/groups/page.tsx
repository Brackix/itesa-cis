'use client';
import { GroupTable } from '@/src/features/groups/components/GroupTable';

export default function GroupsPage() {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Gestión de Grupos</h5>
                    <p>Módulo para la visualización y administración de los grupos del sistema.</p>
                    <GroupTable />
                </div>
            </div>
        </div>
    );
}
