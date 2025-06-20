import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import type { ProfileState } from '../../store/slices/profileSlice';

interface ProfileFormProps {
  initialProfile: ProfileState;
  onSave: (profile: ProfileState) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialProfile, onSave }) => {
  const [formData, setFormData] = useState<ProfileState>(initialProfile);

  useEffect(() => {
    setFormData(initialProfile);
  }, [initialProfile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === 'file' && files && files[0]) {
      setFormData((prev: ProfileState) => ({ ...prev, avatar: files[0].name }));
    } else {
      setFormData((prev: ProfileState) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      alert('Display Name is required.');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display Name */}
      <div className="flex flex-col">
        <label htmlFor="displayName" className="font-medium text-gray-700">Display Name</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          value={formData.displayName}
          onChange={handleChange}
          className="mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-primary"
          required
        />
      </div>

      {/* Email (read-only) */}
      <div className="flex flex-col">
        <label htmlFor="email" className="font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          readOnly
          className="mt-1 p-2 border bg-gray-100 rounded"
        />
      </div>

      {/* Office Location */}
      <div className="flex flex-col">
        <label htmlFor="officeLocation" className="font-medium text-gray-700">Office Location</label>
        <input
          id="officeLocation"
          name="officeLocation"
          type="text"
          value={formData.officeLocation}
          onChange={handleChange}
          className="mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-primary"
        />
      </div>

      {/* Theme */}
      <div className="flex flex-col">
        <label htmlFor="theme" className="font-medium text-gray-700">Theme</label>
        <select
          id="theme"
          name="theme"
          value={formData.theme}
          onChange={handleChange}
          className="mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-primary"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Language */}
      <div className="flex flex-col">
        <label htmlFor="language" className="font-medium text-gray-700">Language</label>
        <select
          id="language"
          name="language"
          value={formData.language}
          onChange={handleChange}
          className="mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-primary"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      {/* Avatar */}
      <div className="flex flex-col">
        <label htmlFor="avatar" className="font-medium text-gray-700">Avatar</label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="mt-1"
        />
        {formData.avatar && (
          <p className="mt-2 text-sm text-gray-600">Selected file: {formData.avatar}</p>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
