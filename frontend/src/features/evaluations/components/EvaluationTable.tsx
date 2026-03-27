'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { useEvaluationStore } from '../hooks/useEvaluations';
import { ProjectCriterionEvaluation, ProjectCriterionStatus } from '../types/evaluation.types';

export const EvaluationTable = () => {
    const { evaluations, loading, fetchEvaluations } = useEvaluationStore();
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchEvaluations();
    }, [fetchEvaluations]);

    const getStatusSeverity = (status: ProjectCriterionStatus) => {
        switch (status) {
            case 'achieved':
                return 'success';
            case 'in_progress':
                return 'info';
            case 'not_achieved':
                return 'danger';
            case 'late':
                return 'warning';
            default:
                return null;
        }
    };

    const statusBodyTemplate = (rowData: ProjectCriterionEvaluation) => {
        return <Tag value={rowData.status.replace('_', ' ')} severity={getStatusSeverity(rowData.status)} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <DataTable 
                value={evaluations} 
                loading={loading}
                paginator 
                rows={10} 
                className="datatable-responsive"
                emptyMessage="No se encontraron evaluaciones."
            >
                <Column field="project_id" header="Proyecto ID" sortable></Column>
                <Column field="criterion_id" header="Criterio ID" sortable></Column>
                <Column field="phase" header="Fase" sortable></Column>
                <Column field="status" header="Estado" body={statusBodyTemplate} sortable></Column>
                <Column field="notes" header="Notas" sortable></Column>
            </DataTable>
        </div>
    );
};
