'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { useEvaluationStore } from '../hooks/useEvaluations';
import { ProjectCriterionEvaluation, ProjectCriterionStatus } from '../types/evaluation.types';

export const EvaluationTable = () => {
    const { evaluations, criteria, loading, fetchEvaluations, fetchCriteria, updateEvaluation } = useEvaluationStore();
    const toast = useRef<Toast>(null);
    
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [editingEval, setEditingEval] = useState<ProjectCriterionEvaluation | null>(null);
    const [editStatus, setEditStatus] = useState<ProjectCriterionStatus>('in_progress');
    const [editNotes, setEditNotes] = useState('');

    useEffect(() => {
        fetchEvaluations();
        fetchCriteria();
    }, [fetchEvaluations, fetchCriteria]);

    const tableData = useMemo(() => {
        const projectsMap = new Map();
        evaluations.forEach((ev) => {
            if (!ev.projects) return;
            if (!projectsMap.has(ev.project_id)) {
                const section = ev.projects.groups?.groups_students?.[0]?.students?.section || 'N/A';
                projectsMap.set(ev.project_id, {
                    project_id: ev.project_id,
                    project_name: ev.projects.name,
                    group_name: ev.projects.groups?.group_name || 'Sin Grupo',
                    section: section,
                });
            }
            const p = projectsMap.get(ev.project_id);
            p[ev.criterion_id] = ev;
        });
        return Array.from(projectsMap.values());
    }, [evaluations]);

    const sections = useMemo(() => {
        const uniqueSections = Array.from(new Set(tableData.map(d => d.section))).filter(s => s !== 'N/A');
        return uniqueSections.map(s => ({ label: `Sección ${s}`, value: s }));
    }, [tableData]);

    const filteredData = selectedSection ? tableData.filter(d => d.section === selectedSection) : tableData;

    const getStatusSeverity = (status: string) => {
        switch (status) {
            case 'achieved': return 'success';
            case 'in_progress': return 'info';
            case 'not_achieved': return 'danger';
            case 'late': return 'warning';
            default: return null;
        }
    };

    const handleCellClick = (evaluation: ProjectCriterionEvaluation) => {
        setEditingEval(evaluation);
        setEditStatus(evaluation.status);
        setEditNotes(evaluation.notes || '');
    };

    const saveEvaluation = () => {
        if (!editingEval) return;
        updateEvaluation({ ...editingEval, status: editStatus, notes: editNotes });
        toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Evaluación actualizada correctamente.' });
        setEditingEval(null);
    };

    const criteriaCellTemplate = (rowData: any, column: any) => {
        const criterionId = column.field;
        const ev: ProjectCriterionEvaluation = rowData[criterionId];
        if (!ev) return <span className="text-400">-</span>;

        const label = ev.status.replace('_', ' ').toUpperCase();
        return (
            <div className="cursor-pointer text-center" onClick={() => handleCellClick(ev)}>
                <Tag value={label} severity={getStatusSeverity(ev.status)} className="w-full white-space-nowrap" />
                {ev.notes && <i className="pi pi-comment ml-2 text-500" title={ev.notes}></i>}
            </div>
        );
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Tablero de Reportes y Seguimiento</h5>
            <Dropdown 
                value={selectedSection} 
                options={sections} 
                onChange={(e) => setSelectedSection(e.value)} 
                placeholder="Filtrar por Sección" 
                showClear 
                className="w-15rem"
            />
        </div>
    );

    const statusOptions = [
        { label: 'EN PROCESO', value: 'in_progress' },
        { label: 'LÓGRADO', value: 'achieved' },
        { label: 'NO LOGRADO', value: 'not_achieved' },
        { label: 'ATRASADO', value: 'late' },
    ];

    return (
        <div className="card">
            <Toast ref={toast} />
            <DataTable 
                value={filteredData} 
                loading={loading}
                header={header}
                rowGroupMode="subheader"
                groupRowsBy="section"
                rowGroupHeaderTemplate={(data) => (
                    <span className="font-bold text-lg p-2">Sección {data.section}</span>
                )}
                scrollable
                scrollHeight="600px"
                className="mt-3 p-datatable-sm"
                emptyMessage="No hay proyectos para esta selección."
            >
                <Column field="group_name" header="Grupo" style={{ minWidth: '150px' }} frozen />
                <Column field="project_name" header="Proyecto" style={{ minWidth: '200px' }} frozen />
                {criteria.map((c) => (
                    <Column key={c.id} field={c.id} header={c.name} body={criteriaCellTemplate} style={{ minWidth: '180px' }} align="center" />
                ))}
            </DataTable>

            <Dialog visible={!!editingEval} style={{ width: '450px' }} header="Actualizar Estado (Profesor)" modal onHide={() => setEditingEval(null)}>
                {editingEval && (
                    <div className="p-fluid mt-3">
                        <div className="field">
                            <label>Estado</label>
                            <Dropdown value={editStatus} options={statusOptions} onChange={(e) => setEditStatus(e.value)} />
                        </div>
                        <div className="field">
                            <label>Notas del Profesor</label>
                            <InputTextarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={4} />
                        </div>
                        <div className="flex justify-content-end mt-4">
                            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setEditingEval(null)} />
                            <Button label="Guardar Evaluacion" icon="pi pi-check" onClick={saveEvaluation} autoFocus />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};
