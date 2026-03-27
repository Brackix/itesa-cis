import { ProjectTable } from '@/src/features/projects/components/ProjectTable';

export default function ProjectsPage() {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Gestión de Proyectos</h5>
                    <ProjectTable />
                </div>
            </div>
        </div>
    );
}
