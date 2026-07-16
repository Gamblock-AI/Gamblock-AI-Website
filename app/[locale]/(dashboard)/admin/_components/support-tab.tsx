import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminSupportCase } from '@/hooks/use-admin-operations';
import {
  AdminEmptyTable,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminTableShell,
} from './admin-shared';

export function SupportTab({ cases }: { cases: AdminSupportCase[] }) {
  const t = useTranslations('adminPage');

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title={t('supportTitle')}
        description={t('supportDescription')}
      />
      <AdminTableShell>
        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-12 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t('thSubject')}</TableHead>
              <TableHead>{t('thType')}</TableHead>
              <TableHead>{t('thPriority')}</TableHead>
              <TableHead>{t('thStatus')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <AdminEmptyTable colSpan={5} text={t('noTickets')} />
            ) : (
              cases.map((supportCase) => (
                <TableRow key={supportCase.id}>
                  <TableCell className="font-mono text-xs">
                    {supportCase.id}
                  </TableCell>
                  <TableCell className="text-navy font-semibold">
                    {supportCase.title}
                  </TableCell>
                  <TableCell>{supportCase.type.replaceAll('_', ' ')}</TableCell>
                  <TableCell>{supportCase.priority}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={supportCase.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
}
