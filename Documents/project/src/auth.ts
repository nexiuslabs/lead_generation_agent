// src/auth.ts
export async function loginApi({ email, password }: { email: string; password: string }) {
  const res = await fetch('https://api.nexiuslabs.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || data.message || 'Login failed');
  }
  return res.json();
}

export async function signupApi({ name, email, password }: { name: string; email: string; password: string }) {
  const res = await fetch('https://api.nexiuslabs.com/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || data.message || 'Signup failed');
  }
  return res.json();
}
