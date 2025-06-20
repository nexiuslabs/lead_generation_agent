import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';

interface ProfileData {
  displayName: string;
  theme: string;
  language: string;
  photoUrl?: string;
}

export const ProfilePage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to load profile');
        const data: ProfileData = await res.json();
        setDisplayName(data.displayName || '');
        setTheme(data.theme || 'light');
        setLanguage(data.language || 'en');
        if (data.photoUrl) setPhotoPreview(data.photoUrl);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => reader.result && setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      // Save basic profile
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, theme, language })
      });
      if (!res.ok) throw new Error('Failed to save profile');
      // Upload photo if selected
      if (photoFile) {
        const form = new FormData();
        form.append('photo', photoFile);
        const photoRes = await fetch('/api/profile/photo', {
          method: 'POST',
          body: form
        });
        if (!photoRes.ok) throw new Error('Failed to upload photo');
      }
      setSuccessMessage('Profile saved!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div className="p-4 text-center">Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      {error && <div className="text-red-500">{error}</div>}
      {successMessage && <div className="text-green-500">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Theme</label>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Profile Photo</label>
          {photoPreview && <img src={photoPreview} alt="Avatar" className="mt-2 w-24 h-24 rounded-full object-cover" />}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="mt-2"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};
