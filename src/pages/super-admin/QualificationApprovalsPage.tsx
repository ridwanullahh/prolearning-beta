import React, { useState, useEffect } from 'react';
import { db } from '../../lib/github-sdk';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

interface PendingQualification {
  id: string;
  instructorId: string;
  qualificationId: string;
  createdAt: string;
  instructorName?: string;
  qualificationName?: string;
}

const QualificationApprovalsPage: React.FC = () => {
  const [pendingQualifications, setPendingQualifications] = useState<PendingQualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingQualifications = async () => {
      setIsLoading(true);
      try {
        const pending = await db.get('pendingQualifications');
        const users = await db.get('users');
        const qualifications = await db.get('qualifications');

        const populatedPending = pending.map((p: any) => {
          const user = users.find((u: any) => u.id === p.instructorId);
          const qualification = qualifications.find((q: any) => q.id === p.qualificationId);
          return {
            ...p,
            instructorName: user?.name,
            qualificationName: qualification?.name,
          };
        });

        setPendingQualifications(populatedPending);
      } catch (error) {
        console.error('Failed to fetch pending qualifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch pending qualifications.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingQualifications();
  }, [toast]);

  const handleApproval = async (id: string, instructorId: string, qualificationId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        await db.insert('instructorQualifications', {
          instructorId,
          qualificationId,
          status: 'approved',
          documentUrl: '', // Or the document URL from the pending request
        });
      }
      
      await db.delete('pendingQualifications', id);
      setPendingQualifications(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: 'Success',
        description: `Qualification update has been ${status}.`,
      });
    } catch (error) {
      console.error(`Failed to ${status} qualification:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${status} qualification.`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Qualification Approvals</h1>
      <p className="text-lg text-gray-600 mb-8">
        Review and approve or reject instructor qualification updates.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instructor</TableHead>
            <TableHead>Qualification</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingQualifications.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.instructorName}</TableCell>
              <TableCell>{p.qualificationName}</TableCell>
              <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="space-x-2">
                <Button onClick={() => handleApproval(p.id, p.instructorId, p.qualificationId, 'approved')}>
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproval(p.id, p.instructorId, p.qualificationId, 'rejected')}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QualificationApprovalsPage;