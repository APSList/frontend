export interface ProfileUser {
  id: string;
  organizationId: number;
  name: string;
  role: 'OWNER' | 'MEMBER';
  email: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}
