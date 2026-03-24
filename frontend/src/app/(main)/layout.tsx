import { Metadata } from 'next';
import Layout from '@/src/components/layout/Layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'ITESA CIS',
    description: 'Sistema de gestión institucional ITESA CIS.',
    icons: {
        icon: '/favicon.ico'
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}
