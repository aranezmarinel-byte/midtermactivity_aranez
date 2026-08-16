import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore';

type Student = {
    id: string;
    student_id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
};

export default function Dashboard() {
    const [students, setStudents] = React.useState<Student[]>([]);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const form = useForm({
        student_id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    React.useEffect(() => {
        const studentsRef = collection(db, 'students');

        const unsubscribe = onSnapshot(
            studentsRef,
            (snapshot) => {
                const data = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<Student, 'id'>),
                }));

                setStudents(data);
                setLoading(false);
                setError(null);
            },
            (firestoreError) => {
                setLoading(false);
                setError(firestoreError.message);
            },
        );

        return () => unsubscribe();
    }, []);

    function resetForm() {
        setEditingId(null);
        form.reset();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const studentData = {
                student_id: form.data.student_id,
                name: form.data.name,
                email: form.data.email,
                phone: form.data.phone || null,
                address: form.data.address || null,
            };

            if (editingId) {
                await updateDoc(doc(db, 'students', editingId), studentData);
            } else {
                await addDoc(collection(db, 'students'), studentData);
            }

            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(student: Student) {
        setEditingId(student.id);
        form.setData({
            student_id: student.student_id,
            name: student.name,
            email: student.email,
            phone: student.phone ?? '',
            address: student.address ?? '',
        });
    }

    async function handleDelete(studentId: string) {
        if (!window.confirm('Are you sure you want to delete this student?')) {
            return;
        }

        setError(null);

        try {
            await deleteDoc(doc(db, 'students', studentId));

            if (editingId === studentId) {
                resetForm();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete student.');
        }
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Manage student records</p>
                    </div>
                </div>

                <div className="mb-8 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                                    Student ID
                                </label>
                                <Input
                                    id="student_id"
                                    name="student_id"
                                    type="text"
                                    value={form.data.student_id}
                                    onChange={(e) => form.setData('student_id', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <Input
                                id="address"
                                name="address"
                                type="text"
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={saving || form.processing}>
                                {saving ? 'Saving...' : editingId !== null ? 'Update Student' : 'Add Student'}
                            </Button>
                            {editingId !== null && (
                                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-left">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold">Student ID</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Email</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Phone</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Address</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            Loading students...
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="px-4 py-3 text-sm">{student.student_id}</td>
                                            <td className="px-4 py-3 text-sm">{student.name}</td>
                                            <td className="px-4 py-3 text-sm">{student.email}</td>
                                            <td className="px-4 py-3 text-sm">{student.phone ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">{student.address ?? '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(student)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(student.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
