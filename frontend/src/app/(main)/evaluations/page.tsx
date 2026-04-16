import { EvaluationTable } from '@/src/features/evaluations/components/EvaluationTable';
import { CriteriaManager } from '@/src/features/evaluations/components/CriteriaManager';

export default function EvaluationsPage() {
    return (
        <div className="grid">
            <div className="col-12">
                <CriteriaManager />
            </div>
            <div className="col-12">
                <EvaluationTable />
            </div>
        </div>
    );
}
