import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL = 'http://localhost:5000/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AccountManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch {
      setError('Failed to load users');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setSuccess('');
    setError('');
  };

  const handleDelete = async (id: number) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSuccess('User deleted');
      fetchUsers();
    } catch {
      setError('Failed to delete user');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      let res;
      if (editingUser) {
        res = await fetch(`${API_URL}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error();
      setSuccess(editingUser ? 'User updated' : 'User created');
      setEditingUser(null);
      setForm({ name: '', email: '', role: '' });
      fetchUsers();
    } catch {
      setError('Failed to save user');
    }
  };

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>{editingUser ? 'Edit User' : 'Add User'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" name="role" value={form.role} onChange={handleFormChange} className="w-full border rounded p-2" required>
                <option value="">-- Select role --</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <Button type="submit">{editingUser ? 'Update' : 'Create'}</Button>
            {editingUser && (
              <Button type="button" variant="outline" onClick={() => { setEditingUser(null); setForm({ name: '', email: '', role: '' }); }}>
                Cancel
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Role</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="border px-2 py-1">{user.name}</td>
                  <td className="border px-2 py-1">{user.email}</td>
                  <td className="border px-2 py-1">{user.role}</td>
                  <td className="border px-2 py-1">
                    <Button size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                    <Button size="sm" variant="outline" className="ml-2" onClick={() => handleDelete(user.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}