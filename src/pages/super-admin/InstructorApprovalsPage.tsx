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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { AuthUser } from '@/lib/auth';

const InstructorApprovalsPage: React.FC = () => {
  const [instructors, setInstructors] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInstructors = async () => {
      setIsLoading(true);
      try {
        const allUsers = await db.get('users');
        const pendingInstructors = allUsers.filter(
          (user: AuthUser) => user.role === 'instructor' && user.approvalStatus === 'pending'
        );
        setInstructors(pendingInstructors);
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch pending instructors.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructors();
  }, [toast]);

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await db.update('users', id, { approvalStatus: status });
      setInstructors(prev => prev.filter(instructor => instructor.id !== id));
      toast({
        title: 'Success',
        description: `Instructor has been ${status}.`,
      });
    } catch (error) {
      console.error(`Failed to ${status} instructor:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${status} instructor.`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Instructor Approvals</h1>
      <p className="text-lg text-gray-600 mb-8">
        Review and approve or reject new instructor applications.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructors.map(instructor => (
            <TableRow key={instructor.id}>
              <TableCell>{instructor.name}</TableCell>
              <TableCell>{instructor.email}</TableCell>
              <TableCell>{new Date(instructor.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Profile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{instructor.name}'s Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p><strong>Headline:</strong> {instructor.instructorProfile?.headline}</p>
                      <p><strong>Bio:</strong> {instructor.instructorProfile?.bio}</p>
                      <p><strong>Qualifications:</strong> {instructor.instructorProfile?.qualifications}</p>
                      <p><strong>Experience:</strong> {instructor.instructorProfile?.experience}</p>
                      {instructor.instructorProfile?.linkedIn && (
                        <p>
                          <strong>LinkedIn:</strong>{' '}
                          <a
                            href={instructor.instructorProfile.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Profile
                          </a>
                        </p>
                      )}
                      {instructor.instructorProfile?.website && (
                        <p>
                          <strong>Website:</strong>{' '}
                          <a
                            href={instructor.instructorProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Website
                          </a>
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => handleApproval(instructor.id, 'approved')}>
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproval(instructor.id, 'rejected')}
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

export default InstructorApprovalsPage;