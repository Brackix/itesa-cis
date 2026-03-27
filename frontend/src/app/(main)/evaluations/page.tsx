import { EvaluationTable } from '@/src/features/evaluations/components/EvaluationTable';

export default function EvaluationsPage() {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Evaluación de Proyectos</h5>
                    <EvaluationTable />
                </div>
            </div>
        </div>
    );
}
