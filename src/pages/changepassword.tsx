import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import Sidebar from '@/components/sidebar';

const ChangePasswordPage: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_new_password: '',
        old_password: '',
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
        // Clear existing errors when user starts typing
        setErrors({});
    };

    const validateForm = () => {
        const formErrors: {[key: string]: string} = {};

        if (formData.new_password.length < 6) {
            formErrors.new_password = 'Password must be at least 6 characters';
        }
        if (formData.new_password !== formData.confirm_new_password) {
            formErrors.confirm_new_password = 'Passwords do not match';
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const changePasswordMutation = useMutation(async () => {
        return fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    mutation ChangePassword($new_password: String!, $old_password: String!) {
                        changePassword(new_password: $new_password, old_password: $old_password)
                    }
                `,
                variables: {
                    new_password: formData.new_password,
                    old_password: formData.old_password
                },
            }),
        }).then((res) => res.json());
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                await changePasswordMutation.mutateAsync();
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                router.push('/login'); // Redirect to login page after successful password change
            } catch (error) {
                console.error('Error changing password:', error);
                // Handle error, maybe display an error message to the user
            }
        }
    };

    return (
        <div className="flex">
            <Sidebar/>
            <div className="flex-1 p-4 ml-64">
                <h1 className="text-xl font-semibold mb-4">Change Password</h1>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="flex flex-col">
                        <label className="mb-1">Old Password:</label>
                        <input
                            type="password"
                            name="old_password"
                            value={formData.old_password}
                            onChange={handleChange}
                            required
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1">New Password:</label>
                        <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                            className="p-2 border rounded"
                        />
                        {errors.new_password && <p className="text-red-500">{errors.new_password}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1">Confirm New Password:</label>
                        <input
                            type="password"
                            name="confirm_new_password"
                            value={formData.confirm_new_password}
                            onChange={handleChange}
                            required
                            className="p-2 border rounded"
                        />
                        {errors.confirm_new_password && <p className="text-red-500">{errors.confirm_new_password}</p>}
                    </div>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
