const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  building: string;
  programme: string;
  floor?: string;
  block?: string;
  laptop?: string;
  assetNumber?: string;
  image?: string; // base64 image string
}

export async function registerUser(payload: RegisterUserPayload) {
  const url = `${BASE_URL}/api/v1/auth/register`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {}
    throw new Error(errorData?.message || "Failed to register user");
  }
  return response.json();
}
