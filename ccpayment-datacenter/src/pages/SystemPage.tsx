import { Card } from '@mui/material';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';

export default function SystemPage() {
  return (
    <>
      <PageHeader title="系统数据" subtitle="系统级 KPI 与全局指标。" />
      <Card sx={{ p: 12 }}>
        <EmptyState
          icon={<BarChart3 size={32} />}
          title="本次方案聚焦商户数据与财务看板"
          desc="系统数据沿用现有实现。"
        />
      </Card>
    </>
  );
}
