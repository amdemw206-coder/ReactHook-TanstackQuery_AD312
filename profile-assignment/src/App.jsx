import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import axios from 'axios';

const fetchProfile = async () => {
  const response = await axios.get('http://localhost:3001/profile');
  return response.data;
};

const updateProfile = async (formData) => {
  if (formData.email === 'conflict@example.com') {
    return Promise.reject(new Error('This email is already taken.'));
  }
  const response = await axios.put('http://localhost:3001/profile', formData);
  return response.data;
};

export default function App() {
  const queryClient = useQueryClient();
  
 
  const { 
    register, 
    handleSubmit, 
    reset, 
    setError, 
    formState: { isDirty, errors } 
  } = useForm();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchProfile,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      reset(updatedData);
      alert("Profile updated successfully!");
    },
    
    onError: (error) => {
      setError('email', { 
        type: 'server', 
        message: error.message 
      });
    }
  });

  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  if (isLoading) {
    return <div style={{ padding: '20px', fontWeight: 'bold' }}>Loading profile data...</div>;
  }

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Edit Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block' }}>Username:</label>
          <input {...register('username', { required: true })} />
        </div>

        <div>
          <label style={{ display: 'block' }}>Email:</label>
          <input type="email" {...register('email', { required: true })} />
          {/* Display localized error directly below input layout */}
          {errors.email && (
            <p style={{ color: 'red', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label style={{ display: 'block' }}>Bio:</label>
          <textarea {...register('bio')} rows="4" style={{ width: '100%' }} />
        </div>

        <div>
          <label>
            <input type="checkbox" {...register('notifications')} /> Receive Notifications
          </label>
        </div>

        <button 
          type="submit" 
          disabled={!isDirty || mutation.isPending}
          style={{ padding: '8px', cursor: (!isDirty || mutation.isPending) ? 'not-allowed' : 'pointer' }}
        >
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}