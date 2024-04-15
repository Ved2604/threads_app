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
        <div> 
            <Sidebar/>
            <h1>Change Password</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Old Password:</label>
                    <input
                        type="password"
                        name="old_password"
                        value={formData.old_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>New Password:</label>
                    <input
                        type="password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        required
                    />
                    {errors.new_password && <p>{errors.new_password}</p>}
                </div>
                <div>
                    <label>Confirm New Password:</label>
                    <input
                        type="password"
                        name="confirm_new_password"
                        value={formData.confirm_new_password}
                        onChange={handleChange}
                        required
                    />
                    {errors.confirm_new_password && <p>{errors.confirm_new_password}</p>}
                </div>
                <button type="submit">Change Password</button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;
