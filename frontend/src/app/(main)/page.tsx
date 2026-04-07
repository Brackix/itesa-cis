'use client';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '@/src/components/layout/context/layoutcontext';
import { ChartData, ChartOptions } from 'chart.js';
import { api } from '@/src/services/api';

const Dashboard = () => {
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        api.get('/dashboard')
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch dashboard data:", err);
                setLoading(false);
            });
    }, []);

    const applyLightTheme = () => {
        const lineOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: { color: '#495057' }
                }
            },
        };
        setLineOptions(lineOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: { color: '#ebedef' }
                }
            },
        };
        setLineOptions(lineOptions);
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    if (loading || !data) {
        return <div className="flex justify-content-center align-items-center min-h-screen"><i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i></div>;
    }

    const pieData: ChartData = {
        labels: ['Logrado', 'En Progreso', 'No Logrado', 'Atrasado'],
        datasets: [
            {
                data: [
                    data.metrics.achieved, 
                    data.metrics.in_progress, 
                    data.metrics.not_achieved, 
                    data.metrics.late
                ],
                backgroundColor: [
                    '#22c55e', 
                    '#3b82f6', 
                    '#ef4444', 
                    '#f59e0b'  
                ],
                hoverBackgroundColor: [
                    '#16a34a',
                    '#2563eb',
                    '#dc2626',
                    '#d97706'
                ]
            }
        ]
    };

    const StatusBodyTemplate = (rowData: any) => {
        const c = rowData.status === 'not_achieved' ? 'unqualified' : rowData.status === 'late' ? 'warning' : 'new';
        const label = rowData.status.replace('_', ' ').toUpperCase();
        return <span className={`customer-badge status-${c}`}>{label}</span>;
    };

    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Proyectos</span>
                            <div className="text-900 font-medium text-xl">{data.totalProjects}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-briefcase text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">Registrados en </span>
                    <span className="text-500">{data.totalGroups} Grupos</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Estudiantes Inscritos</span>
                            <div className="text-900 font-medium text-xl">{data.totalStudents}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-cyan-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Hitos Atrasados</span>
                            <div className="text-900 font-medium text-xl">{data.metrics.late + data.metrics.not_achieved}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-clock text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-red-500 font-medium">Requieren atención </span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Progreso Global</span>
                            <div className="text-900 font-medium text-xl">
                                {data.metrics.total_evaluations > 0 ? Math.round((data.metrics.achieved / data.metrics.total_evaluations) * 100) : 0}%
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-circle text-green-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Hitos completados</span>
                </div>
            </div>

            <div className="col-12 xl:col-7">
                <div className="card">
                    <h5>Grupos Requiriendo Atención (Atrasados/No Logrados)</h5>
                    <DataTable value={data.problematicEvals} rows={5} paginator responsiveLayout="scroll" emptyMessage="No hay hitos atrasados.">
                        <Column field="projects.name" header="Proyecto" sortable style={{ width: '30%' }} />
                        <Column field="projects.groups.group_name" header="Grupo" sortable style={{ width: '30%' }} />
                        <Column field="project_criteria.name" header="Hito" sortable style={{ width: '25%' }} />
                        <Column header="Estado" body={StatusBodyTemplate} style={{ width: '15%' }} />
                    </DataTable>
                </div>
            </div>

            <div className="col-12 xl:col-5">
                <div className="card flex flex-column align-items-center">
                    <h5 className="align-self-start">Estado de Evaluaciones</h5>
                    <Chart type="doughnut" data={pieData} options={{...lineOptions, cutout: '60%'}} style={{ width: '50%' }} />
                </div>
            </div>

            <div className="col-12 xl:col-12">
                <div className="card">
                    <h5>Evaluaciones Recientes</h5>
                    <ul className="p-0 mx-0 mt-0 mb-4 list-none">
                        {data.recentActivity.map((evt: any) => (
                            <li key={evt.id} className="flex align-items-center py-2 border-bottom-1 surface-border">
                                <div className={`w-3rem h-3rem flex align-items-center justify-content-center border-circle mr-3 flex-shrink-0 ${evt.status === 'achieved' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    <i className={`pi ${evt.status === 'achieved' ? 'pi-check' : 'pi-chart-line'} text-xl ${evt.status === 'achieved' ? 'text-green-500' : 'text-blue-500'}`} />
                                </div>
                                <span className="text-900 line-height-3">
                                    Proyecto <span className="text-blue-500 font-medium">{evt.projects?.name}</span>
                                    <span className="text-700"> actualizó hito '{evt.project_criteria?.name}' a {evt.status.replace('_', ' ').toUpperCase()}</span>
                                </span>
                            </li>
                        ))}
                        {data.recentActivity.length === 0 && (
                            <span className="text-500">No hay actividad reciente.</span>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
